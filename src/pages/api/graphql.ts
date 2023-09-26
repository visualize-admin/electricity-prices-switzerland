import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextApiHandler } from "next";

import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { context } from "../../graphql/server-context";


import { metricsPlugin } from "./metricsPlugin";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    metricsPlugin({
      enabled:
        process.env.NODE_ENV === "development" ||
        process.env.METRICS_PLUGIN_ENABLED === "true",
    }),
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

  try {
    await handler(req, res);
  } catch (e) {
    res.status(500).send(`Error: ${e instanceof Error ? e.message : `${e}`}`);
  }
};

export default graphql;
