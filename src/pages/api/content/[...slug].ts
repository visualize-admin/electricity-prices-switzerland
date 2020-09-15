import { NextApiRequest, NextApiResponse } from "next";

import { parseLocaleString } from "../../../locales/locales";
import { getWikiPage } from "../../../domain/gitlab-wiki-api";
import micromark from "micromark";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!Array.isArray(req.query.slug)) {
    throw Error("Slug should be array");
  }
  const locale = parseLocaleString(req.query.locale?.toString());
  const slug = [...req.query.slug, locale].join("/");

  const wikiPage = await getWikiPage(slug);

  if (!wikiPage) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(micromark(wikiPage.content));
  return;
};
