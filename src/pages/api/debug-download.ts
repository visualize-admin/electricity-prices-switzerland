import { InferAPIResponse } from "nextkit";

import { searchGeverDocuments } from "src/domain/gever";
import serverEnv from "src/env/server";
import assert from "src/lib/assert";
import { fetchOperatorInfo } from "src/rdf/search-queries";
import { endpointUrl, getSparqlClientFromRequest } from "src/rdf/sparql-client";
import { api } from "src/server/nextkit";

assert(!!serverEnv, "serverEnv is not defined");

const secret = serverEnv.DEBUG_DOWNLOAD_SECRET;

const handler = api({
  GET: async ({ req }) => {
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
      const client = await getSparqlClientFromRequest(req);
      lindasInfo = await fetchOperatorInfo({ operatorId: queryOid, client });
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
