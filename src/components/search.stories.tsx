import { Box } from "@mui/material";
import { Provider } from "urql";
import { never, fromValue } from "wonka";

import { Search } from "./search";

import type { Meta, StoryObj } from "@storybook/react";

// Mock URQL client
const createMockClient = (mockData?: $IntentionalAny) => ({
  executeQuery: () => {
    if (mockData) {
      return fromValue({
        data: mockData,
        fetching: false,
        error: undefined,
      });
    }
    return never; // Never resolves for empty search
  },
  executeMutation: () => never,
  executeSubscription: () => never,
});

// Mock search results data
const mockSearchResults = {
  search: [
    {
      __typename: "MunicipalityResult" as const,
      id: "351",
      name: "Zürich",
    },
    {
      __typename: "MunicipalityResult" as const,
      id: "261",
      name: "Zuoz",
    },
    {
      __typename: "CantonResult" as const,
      id: "ZH",
      name: "Zürich (Canton)",
    },
    {
      __typename: "OperatorResult" as const,
      id: "ewz",
      name: "Elektrizitätswerk der Stadt Zürich",
    },
    {
      __typename: "MunicipalityResult" as const,
      id: "1061",
      name: "Basel",
    },
    {
      __typename: "CantonResult" as const,
      id: "BS",
      name: "Basel-Stadt",
    },
    {
      __typename: "OperatorResult" as const,
      id: "iwb",
      name: "Industrielle Werke Basel",
    },
  ],
};

const emptySearchResults = {
  search: [],
};

const meta: Meta<typeof Search> = {
  title: "components/Search",
  component: Search,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A global search component that allows users to search for municipalities, cantons, and network operators. Features both desktop and mobile responsive layouts with autocomplete functionality.",
      },
    },
  },
  decorators: [
    (Story, { parameters }) => {
      const mockClient = createMockClient(parameters.mockData);
      return (
        <Provider value={mockClient}>
          <Box sx={{ minHeight: "400px", width: "100%" }}>
            <Story />
          </Box>
        </Provider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Search>;

export const Default: Story = {
  parameters: {
    mockData: mockSearchResults,
    docs: {
      description: {
        story:
          "The default search component with mock data showing various result types including municipalities, cantons, and operators.",
      },
    },
  },
};

export const EmptyResults: Story = {
  parameters: {
    mockData: emptySearchResults,
    docs: {
      description: {
        story:
          "Search component with no results, showing the empty state behavior.",
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    mockData: undefined, // This will cause the query to never resolve, showing loading state
    docs: {
      description: {
        story:
          "Search component in loading state while fetching search results.",
      },
    },
  },
};

export const MobileView: Story = {
  parameters: {
    mockData: mockSearchResults,
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile version of the search component which shows as an expandable search button that opens a full-width search field.",
      },
    },
  },
};
