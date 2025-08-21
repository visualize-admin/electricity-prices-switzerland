import { Decorator } from "@storybook/react";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const withQueryClient: Decorator = (Story) => {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

export default withQueryClient;
