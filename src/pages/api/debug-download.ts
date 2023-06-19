import { NextApiHandler, NextApiRequest } from "next";
import { fetchOperatorInfo } from "../../rdf/search-queries";
import { searchGeverDocuments } from "../../domain/gever";
import { api } from "../../server/nextkit";
import { InferAPIResponse } from "nextkit";
import { endpointUrl } from "../../rdf/sparql-client";

const secret =
  process.env.DEBUG_DOWNLOAD_SECRET ||
  "GqQF$t$Fm^oddinivkY8TT8F^kRuRUJ$NJ5Jt%vQ";

const handler = api({
  GET: async ({ req, res }) => {
    const { oid: queryOid, uid: queryUid, secret: querySecret } = req.query;

    if (!querySecret || querySecret !== secret) {
      throw new Error("Incorrect secret");
    }

    if (!queryOid && !queryUid) {
      throw new Error("Need oid or uid in the query params");
    }

    if (Array.isArray(queryOid) || Array.isArray(queryUid)) {
      throw new Error("queryOid or queryUid should not be arrays");
    }

    let uid: string;
    let lindasInfo: Awaited<ReturnType<typeof fetchOperatorInfo>> | null = null;
    if (queryUid && !Array.isArray(queryUid)) {
      uid = queryUid;
    } else if (queryOid && !Array.isArray(queryOid)) {
      lindasInfo = await fetchOperatorInfo({ operatorId: queryOid });
      uid = lindasInfo?.data.uid;
    } else {
      uid = "Not found";
    }

    const searchResp = await searchGeverDocuments({
      operatorId: queryOid,
      uid,
    });
    return {
      lindasEndpoint: endpointUrl,
      lindasInfo,
      uid,
      searchResp,
    };
  },
});

export type DebugDownloadGetResponse = InferAPIResponse<typeof handler, "GET">;

export default handler;
