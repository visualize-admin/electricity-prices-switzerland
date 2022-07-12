import { NextApiRequest, NextApiResponse } from "next";
import { downloadGeverDocument } from "../../../domain/gever";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const reference = req.query.reference as string;
  const filename = (req.query.filename as string) || "document.pdf";
  const pdfContent = await downloadGeverDocument(reference);
  res.setHeader("Content-type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdfContent);
  res.end();
};
