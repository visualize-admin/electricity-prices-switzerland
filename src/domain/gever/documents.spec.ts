import fs from "fs";
import path from "path";

import fetch from "node-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authenticate } from "src/domain/gever/auth";
import {
  extractFileFromContentResp,
  parseSearchResponse,
  searchGeverDocuments,
} from "src/domain/gever/documents";
import { makeRequest } from "src/domain/gever/soap";
import { parseXMLString } from "src/domain/gever/utils";

vi.mock("src/env/server", () => ({
  __esModule: true,
  default: {
    GEVER_BINDING_IPSTS:
      "https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport",
    GEVER_BINDING_RPSTS:
      "https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256",
    GEVER_BINDING_SERVICE:
      "https://api-bv.egov-abn.uvek.admin.ch/BusinessManagement/GeverService/GeverServiceAdvanced.svc",
  },
}));

vi.mock("src/domain/gever/auth", () => ({
  authenticate: vi.fn(),
  bindings: {
    ipsts: "https://example.com/ipsts",
    rpsts: "https://example.com/rpsts",
    service: "https://example.com/service",
  },
}));

vi.mock("src/domain/gever/soap", () => ({
  makeRequest: vi.fn(),
}));

const mockAuthenticate = vi.mocked(authenticate);
const mockMakeRequest = vi.mocked(makeRequest);

it("should parse search results", () => {
  const res = parseSearchResponse(
    fs.readFileSync(path.join(__dirname, "./examples/search.res.xml"), "utf-8"),
  );
  expect(res.length).toBe(4);
  expect(res[0].id).toBe("9073bf7e-7eaa-4993-9475-350cdde95907");
  expect(res[0].url).toContain("/api/download-operator-document");
});

it("should extract pdf file from content response", () => {
  const buf = fs.readFileSync(
    path.join(__dirname, "./examples/content-resp-pdf.bin"),
  );
  const fileAttrs = extractFileFromContentResp(
    buf,
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:1b1eb29a-a92e-441b-8ac7-f954cb72160e+id=20"',
  );

  expect(fileAttrs.buffer.length).toEqual(42608);
  expect(fileAttrs).toEqual(
    expect.objectContaining({
      contentType: "application/octet-stream",
      mimeType: "application/pdf",
      name: "Dokumente Eingang Netzbetreiber",
      extension: "pdf",
    }),
  );
  fs.writeFileSync(
    `/tmp/${fileAttrs.name}.${fileAttrs.extension}`,
    fileAttrs.buffer,
    "binary",
  );
});

it("should extract xlsx file from content response", () => {
  const buf = fs.readFileSync(
    path.join(__dirname, "./examples/content-resp-xlsx.bin"),
  );
  const { buffer, ...fileAttrs } = extractFileFromContentResp(
    buf,
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:1b1eb29a-a92e-441b-8ac7-f954cb72160e+id=18"',
  );

  expect(buffer.length).toEqual(8395);
  expect(fileAttrs).toEqual(
    expect.objectContaining({
      contentType: "application/octet-stream",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      name: "Abfrage_Netzbetreiber_Meldepflichten_2022-07-07_11-03-21",
      extension: "xlsx",
    }),
  );
  fs.writeFileSync(
    `/tmp/${fileAttrs.name}.${fileAttrs.extension}`,
    buffer,
    "binary",
  );
});

describe("searchGeverDocuments", () => {
  beforeEach(() => {
    const samlAssertion = parseXMLString(
      `<saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"/>`,
    ).documentElement;
    mockAuthenticate.mockResolvedValue({ samlAssertion });
    mockMakeRequest.mockReset();
  });

  it("returns error and no debug when all search options are falsy", async () => {
    const result = await searchGeverDocuments({
      operatorId: undefined,
      uid: undefined,
      referenceId: undefined,
    });

    expect(result).toMatchObject({
      docs: [],
      debug: null,
    });
    expect(result.error).toBeInstanceOf(Error);
  });

  it("returns request in debug but placeholder response when makeRequest throws", async () => {
    mockMakeRequest.mockRejectedValue(new Error("Connection refused"));

    const result = await searchGeverDocuments({
      operatorId: "218",
      uid: undefined,
      referenceId: undefined,
    });

    expect(result.docs).toEqual([]);
    expect(result.error).toBeTruthy();
    expect(result.debug).not.toBeNull();
    expect(typeof result.debug!.request).toBe("string");
    expect(result.debug!.response).toMatch(/no response/i);
  });

  it("returns both request and response in debug when server returns a SOAP fault", async () => {
    const soapFault = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><env:Fault xmlns:env="http://www.w3.org/2003/05/soap-envelope"><env:Reason><env:Text>Access denied</env:Text></env:Reason></env:Fault></s:Body></s:Envelope>`;
    mockMakeRequest.mockResolvedValue({
      text: () => Promise.resolve(soapFault),
    } as fetch.Response);

    const result = await searchGeverDocuments({
      operatorId: "218",
      uid: undefined,
      referenceId: undefined,
    });

    expect(result.docs).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.debug).not.toBeNull();
    expect(typeof result.debug!.request).toBe("string");
    expect(typeof result.debug!.response).toBe("string");
  });

  it("returns docs, null error, and full debug on a valid response", async () => {
    const validResponse = fs.readFileSync(
      path.join(__dirname, "./examples/search.res.xml"),
      "utf-8",
    );
    mockMakeRequest.mockResolvedValue({
      text: () => Promise.resolve(validResponse),
    } as fetch.Response);

    const result = await searchGeverDocuments({
      operatorId: "218",
      uid: undefined,
      referenceId: undefined,
    });

    expect(result.error).toBeNull();
    expect(result.docs.length).toBeGreaterThan(0);
    expect(result.docs[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      url: expect.stringContaining("/api/download-operator-document"),
      year: expect.any(String),
    });
    expect(result.debug).not.toBeNull();
    expect(typeof result.debug!.request).toBe("string");
    expect(typeof result.debug!.response).toBe("string");
  });
});
