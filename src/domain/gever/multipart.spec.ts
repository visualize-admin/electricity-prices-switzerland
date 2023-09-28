import fs from "fs";
import path from "path";

import { parseMultiPart } from "./multipart";

it("should split a multipart buffer", () => {
  const parts = parseMultiPart(
    fs.readFileSync(path.join(__dirname, "./examples/content-resp-pdf.bin"))
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
