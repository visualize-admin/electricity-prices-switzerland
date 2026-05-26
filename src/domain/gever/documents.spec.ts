import fs from "fs";
import path from "path";

import { expect, it, vi } from "vitest";

import {
  extractFileFromContentResp,
  parseSearchResponse,
} from "src/domain/gever/documents";

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

it("should parse search results", () => {
  const res = parseSearchResponse(
    fs.readFileSync(path.join(__dirname, "./examples/search.res.xml"), "utf-8")
  );
  expect(res.length).toBe(4);
  expect(res[0].id).toBe("9073bf7e-7eaa-4993-9475-350cdde95907");
  expect(res[0].url).toContain("/api/download-operator-document");
});

it("should extract pdf file from content response", () => {
  const buf = fs.readFileSync(
    path.join(__dirname, "./examples/content-resp-pdf.bin")
  );
  const fileAttrs = extractFileFromContentResp(
    buf,
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:1b1eb29a-a92e-441b-8ac7-f954cb72160e+id=20"'
  );

  expect(fileAttrs.buffer.length).toEqual(42608);
  expect(fileAttrs).toEqual(
    expect.objectContaining({
      contentType: "application/octet-stream",
      mimeType: "application/pdf",
      name: "Dokumente Eingang Netzbetreiber",
      extension: "pdf",
    })
  );
  fs.writeFileSync(
    `/tmp/${fileAttrs.name}.${fileAttrs.extension}`,
    fileAttrs.buffer,
    "binary"
  );
});

it("should extract xlsx file from content response", () => {
  const buf = fs.readFileSync(
    path.join(__dirname, "./examples/content-resp-xlsx.bin")
  );
  const { buffer, ...fileAttrs } = extractFileFromContentResp(
    buf,
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:1b1eb29a-a92e-441b-8ac7-f954cb72160e+id=18"'
  );

  expect(buffer.length).toEqual(8395);
  expect(fileAttrs).toEqual(
    expect.objectContaining({
      contentType: "application/octet-stream",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      name: "Abfrage_Netzbetreiber_Meldepflichten_2022-07-07_11-03-21",
      extension: "xlsx",
    })
  );
  fs.writeFileSync(
    `/tmp/${fileAttrs.name}.${fileAttrs.extension}`,
    buffer,
    "binary"
  );
});
