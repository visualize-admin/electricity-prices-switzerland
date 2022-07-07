import crypto from "crypto";
import fs from "fs";
import { makeRequest, makeSslConfiguredAgent } from "./soap";
import {
  ns,
  $,
  canonicalizeXML,
  parseXMLString,
  serializeXMLToString,
  stripWhitespace,
} from "./utils";
import req1Template from "./templates/req1.template.xml";
import req2Template from "./templates/req2.template.xml";
import getContentTemplate from "./templates/get-content.template.xml";
import searchDocumentsTemplate from "./templates/search-documents.template.xml";

const bindings = {
  ipsts:
    "https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport",
  rpsts:
    "https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256",
  service:
    "https://api.egov-dev.uvek.admin.ch/tst/BusinessManagement/GeverService/GeverServiceAdvanced.svc",
};

export const makeRequest1 = async () => {
  fs.writeFileSync("/tmp/req1.xml", req1Template);
  const resp = (
    await makeRequest(
      bindings.ipsts,
      req1Template,
      {
        "Content-Type": "text/xml",
        SOAPAction:
          "http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue",
      },
      makeSslConfiguredAgent()
    )
  ).text();
  return resp;
};

export const digestTimestampNode = async (timestampNode: Element) => {
  const timestampCanonical = await canonicalizeXML(timestampNode);
  const hash = crypto.createHash("sha1");
  hash.update(timestampCanonical);
  const digestValue = hash.digest("base64");
  return digestValue;
};

export const digestSignedInfoNode = async (
  signedInfoNode: Element,
  binaryToken: Buffer
) => {
  const hmac = crypto.createHmac("sha1", binaryToken);
  const signedInfoCanonical = await canonicalizeXML(signedInfoNode);
  hmac.update(signedInfoCanonical);
  return hmac.digest("base64");
};

export const makeRequest2 = async (resp1Str: string) => {
  const resp1 = parseXMLString(resp1Str).documentElement;
  const doc = parseXMLString(req2Template).documentElement;

  // Get content from resp 1
  const samlAssertion = $(resp1, ns.saml2, "Assertion");
  const assertionId = samlAssertion.getAttribute("ID");
  const binaryTokenB64 = $(resp1, ns.wst, "BinarySecret", 1)
    .textContent as string;
  const binaryToken = Buffer.from(binaryTokenB64, "base64");

  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");
  const sigNode = $(doc, ns.sig, "Signature");
  const digestValueNode = $(sigNode, ns.sig, "DigestValue");
  const sigValueNode = $(sigNode, ns.sig, "SignatureValue");
  const keyIdentifier = $(sigNode, ns.o, "KeyIdentifier");

  // Insert SAML Assertion
  security.insertBefore(samlAssertion, $(security, ns.sig, "Signature"));

  // Fill timestamp
  const creationDate = new Date().toISOString();
  const expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;

  // Digest timestamp
  const digestValue = await digestTimestampNode(timestampNode);
  digestValueNode.textContent = digestValue;

  // Sign
  const signedInfoNode = $(sigNode, ns.sig, "SignedInfo");
  const signatureValue = await digestSignedInfoNode(
    signedInfoNode,
    binaryToken
  );
  sigValueNode.textContent = signatureValue;

  // Update keyIdentifier to be assertion id
  keyIdentifier.textContent = assertionId;

  let req2 = serializeXMLToString(doc);
  req2 = stripWhitespace(req2);

  fs.writeFileSync("/tmp/req2.xml", req2);
  return await (
    await makeRequest(bindings.rpsts, req2, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    })
  ).text();
};

export const setupRequest3 = (requestTemplate: string, resp2Str: string) => {
  const resp2 = parseXMLString(resp2Str).documentElement;
  const doc = parseXMLString(requestTemplate).documentElement;

  // Get content from resp 1
  const samlAssertion = $(resp2, ns.saml2, "Assertion");

  // Get nodes to fill
  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");
  
  // Fill timestamp
  const creationDate = new Date().toISOString();
  const expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;
  
  security.appendChild(samlAssertion);
  
  return doc
}

const makeContentRequest = async (resp2Str: string, docId: string) => {
  const doc = setupRequest3(getContentTemplate, resp2Str)
  const referenceIdNode = doc.getElementsByTagName("ReferenceID")[0];
  referenceIdNode.textContent = docId;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", req3);

  const resp = await (
    await makeRequest(bindings.service, req3, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    })
  ).arrayBuffer();

  const dv = new Uint8Array(resp);
  const pdfStr = new TextDecoder("ascii").decode(resp);
  const pdfStartMarker = "%PDF-1.4";
  const pdfEndMarker = "%%EOF";
  const start = pdfStr.indexOf(pdfStartMarker);
  const end = pdfStr.indexOf(pdfEndMarker);

  fs.writeFileSync("/tmp/a.pdf", dv.slice(start, end), { encoding: "binary" });

  return pdfStr.slice(start, end);
};

const makeSearchRequest = async (resp2Str: string, search: string) => {
  const doc = setupRequest3(searchDocumentsTemplate, resp2Str)
  const searchTextNode = doc.getElementsByTagName("ParameterValue")[0];
  searchTextNode.textContent = search;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", req3);

  const resp = await makeRequest(bindings.service, req3, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    }).then(x => x.text())
  

  return resp;
};

export const downloadGeverDocument = async (docId: string) => {
  console.log("Request to IP-STS...");
  const resp1 = await makeRequest1();
  console.log("Request to RP-STS...");
  const resp2 = await makeRequest2(resp1);
  console.log("Request to GEVER...");
  const resp3 = await makeContentRequest(resp2, docId);
  return {
    resp1,
    resp2,
    resp3,
    content: "",
  };
};


export const searchGeverDocuments = async (search: string) => {
  console.log("Request to IP-STS...");
  const resp1 = await makeRequest1();
  console.log("Request to RP-STS...");
  const resp2 = await makeRequest2(resp1);
  console.log("Request to GEVER...");
  const resp3 = await makeSearchRequest(resp2, search);
  return {
    resp1,
    resp2,
    resp3,
    content: "",
  };
};
