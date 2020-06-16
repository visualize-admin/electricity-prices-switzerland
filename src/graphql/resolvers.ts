import { QueryResolvers, Resolvers } from "./resolver-types";

const Query: QueryResolvers = {
  municipalities: async () => [{ name: "A" }, { name: "B" }],
};

export const resolvers: Resolvers = {
  Query,
};
