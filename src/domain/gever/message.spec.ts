/**
 * @jest-environment node
 */

import fs from "fs";
import path, { parse } from "path";
import { assert } from "console";
import {
  digestSignedInfoNode,
  digestTimestampNode,
  extractFileFromContentResp,
  parseSearchResponse,
  prepareIpStsMessage,
  prepareRpStsDoc,
} from "./message";
import { parseXMLString, $, ns, serializeXMLToString } from "./utils";

it('should prepare 1st message', () => {
  const message = prepareIpStsMessage()
  expect(message.includes(
    '<a:To s:mustUnderstand="1">https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport</a:To>'
  )).toBe(true)
  expect(message.includes(
    '<Address>http://feds-r.eiam.admin.ch</Address>'
  )).toBe(true)
})

it('should prepare 2nd message', () => {
  const doc = prepareRpStsDoc()
  expect(serializeXMLToString(doc).includes(
    '<a:To s:mustUnderstand="1">https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256</a:To>'
  )).toBe(true)
})

it("should digest the timestamp node", async () => {
  const resp2 = parseXMLString(
    fs.readFileSync(path.join(__dirname, "./examples/req2.xml"), "utf-8")
  ).documentElement;
  const timestampNode = $(resp2, ns.u, "Timestamp");
  const digestValue = await digestTimestampNode(timestampNode);
  const expectedValue = $(resp2, ns.sig, "DigestValue", 1).textContent;
  assert(
    digestValue == expectedValue,
    "Digest value differs from expected value"
  );
});

it("should digest the signed info node", async () => {
  const resp1 = parseXMLString(
    fs.readFileSync(path.join(__dirname, "./examples/res1.xml"), "utf-8")
  ).documentElement;
  const resp2 = parseXMLString(
    fs.readFileSync(path.join(__dirname, "./examples/req2.xml"), "utf-8")
  ).documentElement;
  const signedInfoNode = $(resp2, ns.sig, "SignedInfo", 1);
  const binarySecret = Buffer.from(
    $(resp1, ns.wst, "BinarySecret", 1).textContent as string,
    "base64"
  );
  const signatureValue = await digestSignedInfoNode(
    signedInfoNode,
    binarySecret
  );
  const expectedValue = $(resp2, ns.sig, "SignatureValue", 1).textContent;
  assert(
    signatureValue === expectedValue,
    "Signature value differs from expected value"
  );
});

it("should parse search results", () => {
  const res = parseSearchResponse(
    fs.readFileSync(path.join(__dirname, "./examples/search.res.xml"), "utf-8")
  );
  expect(res.length).toBe(4);
  expect(res[0].id).toBe("9073bf7e-7eaa-4993-9475-350cdde95907");
  expect(res[0].url).toBe(
    "/api/download-operator-document/C9D1E4B1-E836-46D7-8FA0-4FD9032D35D8"
  );
});

it("should extract pdf file from content response", () => {
  const buf = fs.readFileSync(
    path.join(__dirname, "./examples/content-resp-pdf.bin")
  );
  const fileAttrs = extractFileFromContentResp(buf);

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
  const { buffer, ...fileAttrs } = extractFileFromContentResp(buf);

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
