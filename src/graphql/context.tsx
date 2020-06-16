import { createClient, Provider } from "urql";

const client = createClient({
  url: "/api/graphql",
});

export const GraphqlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Provider value={client}>{children}</Provider>;
};
