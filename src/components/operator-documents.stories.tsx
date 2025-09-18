import { Paper } from "@mui/material";

import {
  OperatorDocument,
  OperatorDocumentCategory,
} from "src/graphql/queries";

import {
  groupByCategory,
  OperatorDocumentsPopoverContent,
} from "./operator-documents";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof OperatorDocumentsPopoverContent> = {
  title: "Components/OperatorPopoverContent",
  component: OperatorDocumentsPopoverContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Paper sx={{ maxWidth: 500 }} elevation={1}>
        <Story />
      </Paper>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OperatorDocumentsPopoverContent>;

// Mock data for stories
const mockDocuments: OperatorDocument[] = [
  {
    __typename: "OperatorDocument",
    id: "tariff-2024",
    name: "Tariff Sheet 2024",
    url: "#",
    year: "2024",
    category: OperatorDocumentCategory.Tariffs,
  },
  {
    __typename: "OperatorDocument",
    id: "tariff-2023",
    name: "Tariff Sheet 2023",
    url: "#",
    year: "2023",
    category: OperatorDocumentCategory.Tariffs,
  },
  {
    __typename: "OperatorDocument",
    id: "annual-2023",
    name: "Annual Report 2023",
    url: "#",
    year: "2023",
    category: OperatorDocumentCategory.AnnualReport,
  },
  {
    __typename: "OperatorDocument",
    id: "annual-2022",
    name: "Annual Report 2022",
    url: "#",
    year: "2022",
    category: OperatorDocumentCategory.AnnualReport,
  },
  {
    __typename: "OperatorDocument",
    id: "financial-2023",
    name: "Financial Statement 2023",
    url: "#",
    year: "2023",
    category: OperatorDocumentCategory.FinancialStatement,
  },
];

export const Default: Story = {
  args: {
    operatorName: "Elektrizitätswerk Zürich (EWZ)",
    documentsByCategory: groupByCategory(mockDocuments),
  },
};

export const EmptyState: Story = {
  args: {
    operatorName: "Elektrizitätswerk Zürich (EWZ)",
    documentsByCategory: new Map(),
  },
};

export const SingleDocument: Story = {
  args: {
    operatorName: "Elektrizitätswerk Zürich (EWZ)",
    documentsByCategory: groupByCategory([mockDocuments[0]]),
  },
};

const sampleDocs: OperatorDocument[] = [
  {
    __typename: "OperatorDocument",
    id: "1",
    name: "Tariff Sheet 2023",
    url: "https://example.com/tariff-2023.pdf",
    year: "2023",
    category: OperatorDocumentCategory.Tariffs,
  },
  {
    __typename: "OperatorDocument",
    id: "2",
    name: "Annual Report 2022",
    url: "https://example.com/annual-2022.pdf",
    year: "2022",
    category: OperatorDocumentCategory.AnnualReport,
  },
];

export const Empty: StoryObj = {
  render: () => (
    <OperatorDocumentsPopoverContent
      operatorName="Elektrizitätswerk Zürich (EWZ)"
      documentsByCategory={new Map()}
      loading={false}
    />
  ),
};

export const Loading: StoryObj = {
  render: () => (
    <OperatorDocumentsPopoverContent
      operatorName="Elektrizitätswerk Zürich (EWZ)"
      documentsByCategory={new Map()}
      loading={true}
    />
  ),
};

export const WithDocuments: StoryObj = {
  render: () => (
    <OperatorDocumentsPopoverContent
      operatorName="Elektrizitätswerk Zürich (EWZ)"
      documentsByCategory={groupByCategory(sampleDocs)}
      loading={false}
    />
  ),
};
