import { NextApiRequest, NextApiResponse } from "next";
import { downloadGeverDocument } from "../../../domain/gever";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const reference = req.query.reference as string;
  const filename = (req.query.filename as string) || "document.pdf";
  const fileAttrs = await downloadGeverDocument(reference);
  res.setHeader("Content-type", fileAttrs.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(fileAttrs.name)}.${
      fileAttrs.extension
    }"`
  );
  res.send(fileAttrs.buffer);
  res.end();
};
