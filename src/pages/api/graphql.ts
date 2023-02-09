import configureCors from "cors";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { context } from "../../graphql/server-context";
import { runMiddleware } from "../../lib/run-middleware";

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import responseCachePlugin from "@apollo/server-plugin-response-cache";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    ApolloServerPluginCacheControl({
      // Cache everything for 1 second by default.
      defaultMaxAge: 1,
    }),
    responseCachePlugin(),
  ],
});

const handler = startServerAndCreateNextHandler(server, {
  context,
});

const graphql: NextApiHandler = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(200).end();
  }

  await handler(req, res);
};

export default graphql;
