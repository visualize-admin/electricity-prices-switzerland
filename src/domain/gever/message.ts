import crypto from "crypto";
import fs from "fs";
import { makeRequest, makeSslConfiguredAgent } from "./soap";
import { memoize } from "lodash";
import {
  ns,
  $,
  canonicalizeXML,
  parseXMLString,
  serializeXMLToString,
  stripWhitespace,
  $$,
} from "./utils";
import req1Template from "./templates/req1.template.xml";
import req2Template from "./templates/req2.template.xml";
import getContentTemplate from "./templates/get-content.template.xml";
import searchDocumentsTemplate from "./templates/search-documents.template.xml";
import z from "zod";
import { OperatorDocumentCategory } from "../../graphql/queries";

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

const geverColumnMapping = {
  DocumentID: "id",
  DocumentReferenceID: "reference",
  DocumentName: "name",
  DocumentTyp: "type",
  DocumentType: "type",
  Parent: "parent",
};

const geverTypesMapping = {
  Tarifblatt: "TARIFFS",
  Geschäftsbericht: "FINANCIAL_STATEMENT",
} as Record<string, OperatorDocumentCategory>;

const parseYearFromParent = (parent: string) => {
  const year = /\b(\d{4})\b/.exec(parent)?.[0] as string;
  return year;
};

const documentResultRow = z
  .object({
    id: z.string(),
    reference: z.string(),
    name: z.string(),
    type: z.string(),
    parent: z.string(),
  })
  .transform((x) => {
    return {
      id: x.id,
      name: x.name,
      url: `/api/download-operator-document/${x.reference}?filename=${x.name}`,
      year: parseYearFromParent(x.parent),
      category: geverTypesMapping[x.type],
    };
  });

const enumerate = <T extends unknown>(arr: T[]) => {
  return arr.map((x, i) => [i, x] as const);
};

export const parseSearchResponse = (searchResponse: string) => {
  const start = searchResponse.indexOf("<s:Envelope");
  const end = searchResponse.indexOf("</s:Envelope>") + "</s:Envelope>".length;
  const parsed = parseXMLString(
    searchResponse.slice(start, end)
  ).documentElement;
  const columnNames = $$($(parsed, null, "ColumnNames"), null, "string").map(
    (x) => x.textContent as keyof typeof geverColumnMapping
  );
  const rows = $$(parsed, null, "ResultRow").map((row) =>
    $$($(row, null, "Values"), null, "anyType").map((cell) => cell.textContent)
  );
  const geverDocs = rows.map((r) => {
    const geverDoc = {} as Record<string, string>;
    for (const [i, c] of enumerate(columnNames)) {
      const key = geverColumnMapping[c];
      const v = r[i];
      if (key && v) {
        geverDoc[key] = v;
      }
    }
    return geverDoc;
  });
  return geverDocs.map((d) => documentResultRow.parse(d));
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

  return doc;
};

const makeContentRequest = async (resp2Str: string, docId: string) => {
  const doc = setupRequest3(getContentTemplate, resp2Str);
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
  const pdfStartMarker = "%PDF";
  const pdfEndMarker = "%%EOF";
  const start = pdfStr.indexOf(pdfStartMarker);
  const end = pdfStr.indexOf(pdfEndMarker) + pdfEndMarker.length + 1;

  return Buffer.from(dv.slice(start, end));
};

const makeSearchRequest = async (resp2Str: string, search: string) => {
  const doc = setupRequest3(searchDocumentsTemplate, resp2Str);
  const searchTextNode = doc.getElementsByTagName("ParameterValue")[0];
  searchTextNode.textContent = search;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", req3);

  const resp = await makeRequest(bindings.service, req3, {
    "Content-Type": "application/soap+xml; charset=utf-8",
  }).then((x) => x.text());

  return resp;
};

/**
 * Like memoize but with stale-while-revalidate behavior
 */
const memoizeSwr = <T extends unknown, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options: {
    key: (...args: Args) => string;
    timeout: number;
  }
) => {
  const cache = {} as Record<string, { last: T; updatedAt: number }>;
  const { timeout, key: makeKey } = options;
  const revalidate = async (...args: Args) => {
    const cacheKey = makeKey(...args);
    cache[cacheKey] = {
      last: await fn.apply(null, args),
      updatedAt: Date.now(),
    };
  };
  return async function (...args: Args) {
    const cacheKey = makeKey(...args);
    const last = cache[cacheKey]?.last;
    const updatedAt = cache[cacheKey]?.updatedAt;
    const shouldRefresh = !updatedAt || Date.now() - updatedAt > timeout;
    if (last) {
      if (shouldRefresh) {
        revalidate(...args);
      }
      return last;
    } else {
      await revalidate(...args);
      return cache[cacheKey]?.last;
    }
  };
};

const makeAuthRequest = memoizeSwr(
  async () => {
    const resp1 = await makeRequest1();
    const resp2 = await makeRequest2(resp1);
    return resp2;
  },
  {
    timeout: 10_000,
    key: () => "auth",
  }
);

export const downloadGeverDocument = memoize(async (docId: string) => {
  const authResp = await makeAuthRequest();
  const resp3 = await makeContentRequest(authResp, docId);
  return resp3;
});

export const searchGeverDocuments = async (search: string) => {
  const authResp = await makeAuthRequest();
  const searchResp = await makeSearchRequest(authResp, search);
  return parseSearchResponse(searchResp);
};
