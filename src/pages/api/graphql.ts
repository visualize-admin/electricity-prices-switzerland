import { ApolloServer } from "apollo-server-micro";
import configureCors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import { resolvers } from "../../graphql/resolvers";
import typeDefs from "../../graphql/schema.graphql";
import { context } from "../../graphql/server-context";
import { runMiddleware } from "../../lib/run-middleware";

const cors = configureCors();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  // Enable playground in production
  introspection: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const startServer = server.start();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await startServer;
  const handler = await server.createHandler({ path: "/api/graphql" });
  await runMiddleware(req, res, cors);
  return handler(req, res);
};
