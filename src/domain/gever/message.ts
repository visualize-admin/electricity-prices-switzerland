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
import { parseMultiPart } from "./multipart";
import { truthy } from "../../lib/truthy";
import { decrypt, encrypt } from "./encrypt";

const bindings = {
  ipsts:
    process.env.GEVER_BINDING_IPSTS ||
    "https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport",
  rpsts:
    process.env.GEVER_BINDING_RPSTS ||
    "https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256",
  service:
    process.env.GEVER_BINDING_SERVICE ||
    "https://api-bv.egov-abn.uvek.admin.ch/BusinessManagement/GeverService/GeverServiceAdvanced.svc",
};

type Awaited<T> = T extends Promise<infer S> ? S : never;

export const prepareIpStsMessage = () => {
  const doc = parseXMLString(req1Template).documentElement;
  const toNode = $(doc, ns.a, "To");
  toNode.textContent = bindings.ipsts;
  const endpointReference = $(doc, null, "EndpointReference");
  const address = $(endpointReference, null, "Address");
  address.textContent = `http://${new URL(bindings.rpsts).hostname}`;
  return stripWhitespace(serializeXMLToString(doc));
};

export const makeIpStsRequest = async () => {
  const message = prepareIpStsMessage();
  fs.writeFileSync("/tmp/req1.xml", message);

  const respText = await (
    await makeRequest(
      bindings.ipsts,
      message,
      {
        "Content-Type": "text/xml",
        SOAPAction:
          "http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue",
      },
      makeSslConfiguredAgent()
    )
  ).text();

  const doc = parseXMLString(respText).documentElement;

  const samlAssertion = $(doc, ns.saml2, "Assertion");
  const assertionId = samlAssertion.getAttribute("ID");
  const binaryTokenB64 = $(doc, ns.wst, "BinarySecret", 1)
    .textContent as string;
  const binaryToken = Buffer.from(binaryTokenB64, "base64");

  if (!samlAssertion) {
    throw new Error("Could not find saml assertion in IP-STS response");
  }

  if (!assertionId) {
    throw new Error("Could not find assertion id in IP-STS response");
  }

  return {
    samlAssertion,
    assertionId,
    binaryToken,
  };
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
  ReferenceID: "reference",
  DocumentID: "id",
  FileName: "name",
  DocumentType: "type",
  Period: "period",
};

const geverTypesMapping = {
  tariffs_provider: OperatorDocumentCategory.Tariffs,
  financial_statement: OperatorDocumentCategory.FinancialStatement,
  annual_report: OperatorDocumentCategory.AnnualReport,
} as Record<string, OperatorDocumentCategory>;

const parseYearFromPeriod = (period: string) => {
  const year = /\b(\d{4})\b/.exec(period)?.[0] as string;
  return year;
};

const documentResultRow = z
  .object({
    id: z.string(),
    reference: z.string(),
    name: z.string(),
    type: z.string(),
    period: z.string(),
  })
  .transform((x) => {
    return {
      id: x.id,
      name: x.name,
      url: `/api/download-operator-document/${encrypt(x.reference)}`,
      year: parseYearFromPeriod(x.period),
      category: geverTypesMapping[x.type],
    };
  });

const enumerate = <T extends unknown>(arr: T[]) => {
  return arr.map((x, i) => [i, x] as const);
};

const sliceStartEnd = (str: string, start: string, end: string) => {
  return str.slice(str.indexOf(start), str.indexOf(end) + end.length);
};

const assertNoErrors = (resp: string) => {
  if (resp.indexOf("env:Fault") > -1) {
    const reason = sliceStartEnd(resp, "<env:Reason>", "</env:Reason>").replace(
      /\n/g,
      ""
    );
    throw new Error(reason);
  }
};

export const parseSearchResponse = (searchResponse: string) => {
  assertNoErrors(searchResponse);

  const parsed = parseXMLString(
    sliceStartEnd(searchResponse, "<s:Envelope", "</s:Envelope>")
  ).documentElement;
  const columnNames = $$($(parsed, null, "ColumnNames"), null, "string").map(
    (x) => x.textContent as keyof typeof geverColumnMapping
  );

  const rawRows = Array.from(parsed.getElementsByTagName("ResultRow"));
  const rows = rawRows.map((row) =>
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

  return geverDocs
    .map((d, i) => {
      try {
        return documentResultRow.parse(d);
      } catch (e) {
        console.error("Could not parse gever document", e);
        console.info(`Original result row: ${rows[i]}`);
        return null;
      }
    })
    .filter((x) => x?.category !== OperatorDocumentCategory.FinancialStatement)
    .filter(truthy);
};

type IPSTSInfo = Awaited<ReturnType<typeof makeIpStsRequest>>;

export const prepareRpStsDoc = () => {
  const doc = parseXMLString(req2Template).documentElement;
  const toNode = $(doc, ns.a, "To");
  toNode.textContent = bindings.rpsts;
  const endpointReference = $(doc, null, "EndpointReference");
  const address = $(endpointReference, null, "Address");
  address.textContent = "urn:eiam.admin.ch:pep:GEVER-WS";
  return doc;
};

export const makeRpStsRequest = async (ipStsInfo: IPSTSInfo) => {
  const { samlAssertion, assertionId, binaryToken } = ipStsInfo;
  const doc = prepareRpStsDoc();

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
  const respText = await (
    await makeRequest(bindings.rpsts, req2, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    })
  ).text();
  fs.writeFileSync("/tmp/res2.xml", respText);

  const resp2 = parseXMLString(respText).documentElement;
  const samlAssertion2 = $(resp2, ns.saml2, "Assertion");
  if (!samlAssertion2) {
    throw new Error("Could not find SAML assertion in RP-STS response");
  }

  return {
    samlAssertion: samlAssertion2,
  };
};

type RPSTSInfo = Awaited<ReturnType<typeof makeRpStsRequest>>;

export const setupGeverAPIRequest = (
  requestTemplate: string,
  rpStsInfo: RPSTSInfo
) => {
  const doc = parseXMLString(requestTemplate).documentElement;

  // Get nodes to fill
  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");

  // Fill timestamp
  const creationDate = new Date().toISOString();
  const expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;

  security.appendChild(rpStsInfo.samlAssertion);

  return doc;
};

export const extractFileFromContentResp = (
  buf: Buffer
): {
  buffer: Buffer;
  contentType: string;
  name: string;
  extension: string;
  mimeType: string;
} => {
  const parts = parseMultiPart(buf);

  const [metaPart, contentPart] = parts;

  const metaXML = metaPart.content.toString();
  const soapMeta = parseXMLString(metaXML).documentElement;
  const mimeType = $(soapMeta, null, "MimeType").textContent!;
  const name = $(soapMeta, null, "Name").textContent!;
  const extension = $(soapMeta, null, "Extension").textContent!;

  return {
    buffer: contentPart.content,
    contentType: contentPart.headers["Content-Type"],
    mimeType,
    name,
    extension,
  };
};

const makeContentRequest = async (rpStsInfo: RPSTSInfo, docId: string) => {
  const doc = setupGeverAPIRequest(getContentTemplate, rpStsInfo);
  const referenceIdNode = doc.getElementsByTagName("ReferenceID")[0];
  referenceIdNode.textContent = docId;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/content-request.xml", req3);

  const resp = await makeRequest(bindings.service, req3, {
    "Content-Type": "application/soap+xml; charset=utf-8",
  });
  const buffer = await resp.buffer();

  return extractFileFromContentResp(buffer);
};

const makeSearchRequest = async (
  rpStsInfo: RPSTSInfo,
  searchOptions: SearchOptions
) => {
  const doc = setupGeverAPIRequest(searchDocumentsTemplate, rpStsInfo);

  if (!searchOptions.uid && !searchOptions.operatorId) {
    throw new Error(
      "Both uid and operatorId cannot be falsy when searching operator documents"
    );
  }

  const parameterNameNode = doc.getElementsByTagName("ParameterName")[0];
  const parameterName = searchOptions.uid
    ? "Gtx_ELCOM_ERH_UID_Suche"
    : "Gtx_ELCOM_ERH_OpID_Suche";
  parameterNameNode.textContent = parameterName;

  const parameterValueNode = doc.getElementsByTagName("ParameterValue")[0];
  const parameterValue = searchOptions.uid
    ? searchOptions.uid
    : searchOptions.operatorId;
  parameterValueNode.textContent = parameterValue;

  console.log(
    `Searching with parameterName=${parameterName}, parameterValue=${parameterValue}`
  );

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", req3);

  const resp = await makeRequest(bindings.service, req3, {
    "Content-Type": "application/soap+xml; charset=utf-8",
  }).then((x) => x.text());

  return {
    request: req3,
    response: resp,
  };
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
    console.log("IP-STS request...");
    const ipStsInfo = await makeIpStsRequest();
    console.log(`IP-STS OK, assertion: ${ipStsInfo.assertionId}`);
    console.log("RP-STS...");
    const resp2 = await makeRpStsRequest(ipStsInfo);
    console.log(`RP-STS OK: ${resp2.samlAssertion}`);
    return resp2;
  },
  {
    timeout: 10_000,
    key: () => "auth",
  }
);

export const downloadGeverDocument = memoize(
  async (encryptedReference: string) => {
    const reference = decrypt(encryptedReference);
    console.log("Download gever document", reference);
    const authResp = await makeAuthRequest();
    const resp3 = await makeContentRequest(authResp, reference);
    return resp3;
  }
);

type SearchOptions = {
  operatorId: string;
  uid: string | undefined;
};

export const searchGeverDocuments = async (searchOptions: SearchOptions) => {
  console.log("Search gever documents", searchOptions);
  const authResp = await makeAuthRequest();
  const { request, response } = await makeSearchRequest(
    authResp,
    searchOptions
  );
  fs.writeFileSync("/tmp/search-resp.xml", response);
  return {
    debug: {
      response,
      request,
      bindings,
    },
    docs: parseSearchResponse(response),
  };
};
