import { ApolloServer } from "@apollo/server";
import { DocumentNode } from "graphql";

import { GraphqlRequestContext } from "src/graphql/server-context";

export type ExecuteGraphqlQuery = <
  TData = unknown,
  TVariables = Record<string, $IntentionalAny>
>(
  query: DocumentNode,
  variables?: TVariables
) => Promise<TData>;

/**
 * Creates a GraphQL query executor that abstracts away Apollo Server's response format.
 * Takes an Apollo Server instance and returns a function that accepts GraphQL context
 * and returns the executeGraphqlQuery helper.
 *
 * This is used in the server-side code to run GraphQL queries against the Apollo Server.
 * It's important that we use directly the Apollo Server instance (instead of directly
 * urql executeExchange) to ensure that caching and other middlewares are properly applied.
 *
 * @param apolloServer - The Apollo Server instance to execute queries against
 * @returns A function that takes GraphQL context and returns the query executor
 */
export const createExecuteGraphqlQuery =
  (apolloServer: ApolloServer<GraphqlRequestContext>) =>
  (graphqlContext: GraphqlRequestContext): ExecuteGraphqlQuery => {
    return async <TData, TVariables>(
      query: DocumentNode,
      variables?: TVariables
    ): Promise<TData> => {
      const response = await apolloServer.executeOperation<TData>(
        {
          query,
          variables: variables ?? {},
        },
        {
          contextValue: graphqlContext,
        }
      );

      if (response.body.kind !== "single") {
        throw new Error("Expected single GraphQL response");
      }

      if (response.body.singleResult.errors) {
        throw new Error(
          `GraphQL errors: ${response.body.singleResult.errors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      if (!response.body.singleResult.data) {
        throw new Error("No data returned from GraphQL query");
      }

      return response.body.singleResult.data as TData;
    };
  };
