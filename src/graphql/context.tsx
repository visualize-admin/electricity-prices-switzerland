import { ReactNode } from "react";
import { createClient, Provider } from "urql";

const client = createClient({
  url: "/api/graphql",
});

export const GraphqlProvider = ({ children }: { children: ReactNode }) => {
  return <Provider value={client}>{children}</Provider>;
};
