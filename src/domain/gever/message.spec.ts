/**
 * @jest-environment node
 */

import fs from "fs";
import path, { parse } from "path";
import { assert } from "console";
import {
  digestSignedInfoNode,
  digestTimestampNode,
  parseSearchResponse,
} from "./message";
import { parseXMLString, $, ns } from "./utils";

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
  expect(res.length).toBe(3);
  expect(res[0].id).toBe("9073bf7e-7eaa-4993-9475-350cdde95907");
});