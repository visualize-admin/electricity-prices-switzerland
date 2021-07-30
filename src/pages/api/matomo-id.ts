import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.json({ matomoId: process.env.MATOMO_ID });
};
