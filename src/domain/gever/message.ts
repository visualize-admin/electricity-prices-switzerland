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
import req3Template from "./templates/req3.template.xml";

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
  const resp = await makeRequest(
    bindings.ipsts,
    req1Template,
    {
      "Content-Type": "text/xml",
      SOAPAction: "http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue",
    },
    makeSslConfiguredAgent()
  );
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
  return await makeRequest(bindings.rpsts, req2, {
    "Content-Type": "application/soap+xml; charset=utf-8",
  });
};

export const makeRequest3 = async (resp2Str: string, docId: string) => {
  const resp2 = parseXMLString(resp2Str).documentElement;
  const doc = parseXMLString(req3Template).documentElement;

  // Get content from resp 1
  const samlAssertion = $(resp2, ns.saml2, "Assertion");

  // Get nodes to fill
  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");
  const referenceIdNode = doc.getElementsByTagName("ReferenceID")[0];

  // Fill timestamp
  const creationDate = new Date().toISOString();
  const expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;

  security.appendChild(samlAssertion);
  referenceIdNode.textContent = docId;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", req3);

  return await makeRequest(bindings.service, req3, {
    "Content-Type": "application/soap+xml; charset=utf-8",
  });
};

export const makeDownloadRequest = async (docId: string) => {
  console.log("Request to IP-STS...");
  const resp1 = await makeRequest1();
  console.log("Request to RP-STS...");
  const resp2 = await makeRequest2(resp1);
  // const resp3 = await makeRequest3(resp2, docId);
  return {
    resp1,
    resp2,
    resp3: "",
    content: "",
  };
};
