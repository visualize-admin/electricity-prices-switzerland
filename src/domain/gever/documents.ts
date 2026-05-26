import fs from "fs";

import { memoize } from "lodash";
import z from "zod";

import { authenticate, bindings, RPSTSInfo } from "src/domain/gever/auth";
import { decrypt, encrypt } from "src/domain/gever/encrypt";
import { parseMultiPart } from "src/domain/gever/multipart";
import { redactSAML } from "src/domain/gever/redact";
import { makeRequest } from "src/domain/gever/soap";
import * as templates from "src/domain/gever/templates";
import {
  $,
  $$,
  ns,
  parseXMLString,
  serializeXMLToString,
  stripWhitespace,
} from "src/domain/gever/utils";
import { OperatorDocumentCategory } from "src/graphql/queries";
import { truthy } from "src/lib/truthy";
import { ServerError } from "src/server/errors";

type Awaited<T> = T extends Promise<infer S> ? S : never;

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

const enumerate = <T>(arr: T[]) => arr.map((x, i) => [i, x] as const);

const sliceStartEnd = (str: string, start: string, end: string) =>
  str.slice(str.indexOf(start), str.indexOf(end) + end.length);

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

export const extractFileFromContentResp = (
  buf: Buffer,
  contentType: string
): {
  buffer: Buffer;
  contentType: string;
  name: string;
  extension: string;
  mimeType: string;
} => {
  const parts = parseMultiPart(buf, contentType);
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

const setupGeverAPIRequest = (
  requestTemplate: string,
  rpStsInfo: RPSTSInfo
) => {
  const doc = parseXMLString(requestTemplate).documentElement;
  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");
  const creationDate = new Date().toISOString();
  const expirationDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;
  security.appendChild(rpStsInfo.samlAssertion);
  return doc;
};

const requestContent = async (rpStsInfo: RPSTSInfo, docId: string) => {
  const doc = setupGeverAPIRequest(templates.getContent, rpStsInfo);
  const referenceIdNode = doc.getElementsByTagName("ReferenceID")[0];
  referenceIdNode.textContent = docId;

  const req3 = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/content-request.xml", req3);

  let resp: Awaited<ReturnType<typeof makeRequest>>;
  try {
    resp = await makeRequest(bindings.service, req3, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    });
  } catch (e) {
    throw new ServerError("GEVER_SVC", e);
  }

  const buffer = await resp.buffer();
  const contentType = resp.headers.get("content-type");
  if (!contentType) {
    throw new Error(
      "Cannot extract content from PDF due to lack of content-type header"
    );
  }
  return extractFileFromContentResp(buffer, contentType);
};

type SearchOptions = {
  operatorId: string | undefined;
  uid: string | undefined;
  referenceId: string | undefined;
};

const requestSearch = async (
  rpStsInfo: RPSTSInfo,
  searchOptions: SearchOptions
) => {
  const doc = setupGeverAPIRequest(templates.searchDocuments, rpStsInfo);

  const parameterName = searchOptions.referenceId
    ? "Gtx_ELCOM_ERH_REFID_Suche"
    : searchOptions.uid
    ? "Gtx_ELCOM_ERH_UID_Suche"
    : "Gtx_ELCOM_ERH_OpID_Suche";
  const parameterValue =
    searchOptions.referenceId ?? searchOptions.uid ?? searchOptions.operatorId;

  if (!parameterValue) {
    return {
      request: null,
      response: null,
      error: new Error("referenceId, uid, and operatorId cannot all be falsy"),
    };
  }

  doc.getElementsByTagName("ParameterName")[0].textContent = parameterName;
  doc.getElementsByTagName("ParameterValue")[0].textContent = parameterValue;

  console.info(
    `Searching with parameterName=${parameterName}, parameterValue=${parameterValue}`
  );

  const request = stripWhitespace(serializeXMLToString(doc));
  fs.writeFileSync("/tmp/req3.xml", request);

  let response: string | null = null;
  let error: unknown = null;
  try {
    response = await makeRequest(bindings.service, request, {
      "Content-Type": "application/soap+xml; charset=utf-8",
    }).then((x) => x.text());
  } catch (e) {
    error = new ServerError("GEVER_SVC", e);
  }

  return { request, response, error };
};

export const downloadGeverDocument = memoize(
  async (encryptedReference: string) => {
    const reference = decrypt(encryptedReference);
    console.info("Download gever document", reference);
    const authResp = await authenticate();
    return requestContent(authResp, reference);
  }
);

export const searchGeverDocuments = async (searchOptions: SearchOptions) => {
  const authResp = await authenticate();
  const {
    request,
    response,
    error: requestError,
  } = await requestSearch(authResp, searchOptions);

  let docs: ReturnType<typeof parseSearchResponse> = [];
  let error: unknown = requestError;

  if (response !== null) {
    fs.writeFileSync("/tmp/search-resp.xml", response);
    try {
      docs = parseSearchResponse(response);
    } catch (e) {
      error = e;
    }
  }

  return {
    docs,
    error,
    debug:
      request !== null
        ? {
            request: redactSAML(request),
            response:
              response !== null
                ? redactSAML(response)
                : "(no response — network error)",
            bindings,
          }
        : null,
  };
};
