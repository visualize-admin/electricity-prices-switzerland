/* eslint-disable import/order */

import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextApiHandler } from "next";

import serverEnv from "src/env/server";
import { resolvers } from "src/graphql/resolvers";
import typeDefs from "src/graphql/schema.graphql";
import {
  contextFromAPIRequest,
  GraphqlRequestContext,
} from "src/graphql/server-context";
import assert from "src/lib/assert";
import { createMetricsPlugin } from "src/apollo/plugins/metrics-plugin";
import { runMiddleware } from "src/pages/api/run-middleware";
import { createLogMiddleware } from "src/pages/api/log-middleware";

assert(!!serverEnv, "serverEnv is not defined");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  apollo: {},
  introspection: serverEnv.NODE_ENV === "development",
  plugins: [
    // Unified metrics plugin with in-memory collection, periodic console logging, and Redis persistence
    createMetricsPlugin(
      serverEnv.NODE_ENV === "development" || serverEnv.METRICS_ENABLED
    ),
    serverEnv.NODE_ENV === "development"
      ? ApolloServerPluginLandingPageLocalDefault({ embed: false })
      : ApolloServerPluginLandingPageDisabled(),
    ApolloServerPluginCacheControl({
      // Cache everything for 1 second by default.
      defaultMaxAge: 1,
    }),
    responseCachePlugin<GraphqlRequestContext>({
      extraCacheKeyData: async (ctx) => {
        const sunshineDataService = ctx.contextValue.sunshineDataService.name;
        const sparqlEndpoint =
          ctx.contextValue.sparqlClient.query.endpoint.endpointUrl;
        const cacheKey = `sunshine-data-service:${sunshineDataService}/sparql-endpoint:${sparqlEndpoint}`;
        return cacheKey;
      },
    }),
  ],
});

const handler = startServerAndCreateNextHandler(server, {
  context: contextFromAPIRequest,
});

const logMiddleware = createLogMiddleware({
  filepath: "/tmp/graphql.log",
});

// Enable this middleware to log GraphQL queries and variables to a file.
// This is useful for debugging or for making integration tests
const LOG_MIDDLEWARE_ENABLED = false;

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
    if (LOG_MIDDLEWARE_ENABLED) {
      await runMiddleware(req, res, logMiddleware);
    }
    await handler(req, res);
  } catch (e) {
    res.status(500).send(`Error: ${e instanceof Error ? e.message : `${e}`}`);
  }
};

export default graphql;
