import { NextApiRequest, NextApiResponse } from "next";
import { downloadGeverDocument } from "../../../domain/gever";

// Taken from node.js source code
// @see https://github.com/nodejs/node/blob/main/lib/_http_common.js#L216C1-L216C51
const badCharRegex = /[^\t\x20-\x7e\x80-\xff]/gi;

const removeBadChars = (str: string) => {
  return str.replace(badCharRegex, "");
};

const sanitizeHeaderValue = (str: string) => {
  return encodeURIComponent(removeBadChars(str));
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const reference = req.query.reference as string;
  const filename = (req.query.filename as string) || "document.pdf";
  const fileAttrs = await downloadGeverDocument(reference);
  res.setHeader("Content-type", fileAttrs.contentType);
  console.log(`Downloading ${fileAttrs.name}`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeHeaderValue(
      `${fileAttrs.name}.${fileAttrs.extension}`
    )}"`
  );
  res.send(fileAttrs.buffer);
  res.end();
};
