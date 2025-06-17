import { isServerSide } from "src/utils/server-side";
import { cacheExchange, Exchange, fetchExchange, ssrExchange } from "urql";
import { executeExchange } from "@urql/exchange-execute";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "src/graphql/schema.graphql";
import { resolvers } from "src/graphql/resolvers";

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

/** @knipignore */
export const ssr = ssrExchange({
  isClient: false,
  initialState: {},
});

/** @knipignore */
export const exchanges: Exchange[] = [
  cacheExchange,
  ssr,
  executeExchange({
    schema,
  }) as unknown as Exchange,
];
