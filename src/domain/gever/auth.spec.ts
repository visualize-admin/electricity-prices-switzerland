import { assert } from "console";
import fs from "fs";
import path from "path";

import { expect, it, vi } from "vitest";

import {
  digestSignedInfoNode,
  digestTimestampNode,
  prepareIpStsMessage,
  prepareRpStsDoc,
} from "src/domain/gever/auth";
import {
  $,
  ns,
  parseXMLString,
  serializeXMLToString,
} from "src/domain/gever/utils";

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

it("should prepare 1st message", () => {
  const message = prepareIpStsMessage();
  expect(
    message.includes(
      '<a:To s:mustUnderstand="1">https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport</a:To>'
    )
  ).toBe(true);
  expect(
    message.includes("<Address>http://feds-r.eiam.admin.ch</Address>")
  ).toBe(true);
});

it("should prepare 2nd message", () => {
  const doc = prepareRpStsDoc();
  expect(
    serializeXMLToString(doc).includes(
      '<a:To s:mustUnderstand="1">https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256</a:To>'
    )
  ).toBe(true);
});

it("should digest the timestamp node", async () => {
  const resp2 = parseXMLString(
    fs.readFileSync(path.join(__dirname, "./examples/req2.xml"), "utf-8")
  ).documentElement;
  const timestampNode = $(resp2, ns.u, "Timestamp");
  const digestValue = await digestTimestampNode(timestampNode);
  const expectedValue = $(resp2, ns.sig, "DigestValue", 1).textContent;
  assert(
    digestValue === expectedValue,
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
