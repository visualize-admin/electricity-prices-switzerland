import fs from "fs";
import path from "path";

import { it, expect } from "vitest";

import { parseMultiPart } from "./multipart";

it("should split a multipart buffer", () => {
  const parts = parseMultiPart(
    fs.readFileSync(path.join(__dirname, "./examples/content-resp-pdf.bin")),
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:1b1eb29a-a92e-441b-8ac7-f954cb72160e+id=20"'
  );
  expect(parts.length).toEqual(2);
  expect(
    parts.map((p) => ({ ...p.headers, "Content-Length": p.content.length }))
  ).toEqual([
    {
      "Content-ID": "<http://tempuri.org/0>",
      "Content-Length": 819,
      "Content-Transfer-Encoding": "8bit",
      "Content-Type":
        'application/xop+xml;charset=utf-8;type="application/soap+xml"',
    },
    {
      "Content-ID": "<http://tempuri.org/1/637939091222000605>",
      "Content-Length": 42608,
      "Content-Transfer-Encoding": "binary",
      "Content-Type": "application/octet-stream",
    },
  ]);
});

it("should split a multipart buffer 2", () => {
  const parts = parseMultiPart(
    fs.readFileSync(path.join(__dirname, "./examples/content-resp-pdf2.bin")),
    'multipart/related; type="application/xop+xml";start="<http://tempuri.org/0>";boundary="uuid:81608487-dec2-47b6-a41f-4e9cab2f4a7c+id=170";start-info="application/soap+xml"'
  );
  expect(parts.length).toEqual(2);
  expect(
    parts.map((p) => ({ ...p.headers, "Content-Length": p.content.length }))
  ).toEqual([
    {
      "Content-ID": "<http://tempuri.org/0>",
      "Content-Length": 811,
      "Content-Transfer-Encoding": "8bit",
      "Content-Type":
        'application/xop+xml;charset=utf-8;type="application/soap+xml"',
    },
    {
      "Content-ID": "<http://tempuri.org/1/638320943763148809>",
      "Content-Length": 712352,
      "Content-Transfer-Encoding": "binary",
      "Content-Type": "application/octet-stream",
    },
  ]);
  fs.writeFileSync("/tmp/tutu.pdf", parts[1].content);
});
