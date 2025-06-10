import { ReactNode } from "react";
import { createClient, Provider } from "urql";
import { exchanges } from "./urql-exchanges";

const client = createClient({
  url: "/api/graphql",
  exchanges,
  suspense: true,
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
