import { ReactNode } from "react";
import { createClient, Provider } from "urql";
import { exchanges } from "./urql-exchanges";
import { isServerSide } from "src/utils/server-side";

const client = createClient({
  url: "/api/graphql",
  exchanges,
  suspense: isServerSide ? true : false,

  // Uncomment to test correct cache behavior
  // requestPolicy: isServerSide ? "network-only" : "cache-only",
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
