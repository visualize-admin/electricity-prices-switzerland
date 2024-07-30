import { NextApiRequest, NextApiResponse } from "next";

import serverEnv from "src/env/server";
import assert from "src/lib/assert";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  assert(!!serverEnv, "serverEnv is not defined");
  res.json({ matomoId: serverEnv.MATOMO_ID });
};
