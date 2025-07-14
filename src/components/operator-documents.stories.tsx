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
    documentsByCategory: groupByCategory(mockDocuments),
  },
};

export const WithOnlyTariffs: Story = {
  args: {
    documentsByCategory: groupByCategory(
      mockDocuments.filter(
        (doc) => doc.category === OperatorDocumentCategory.Tariffs
      )
    ),
  },
};

export const WithOnlyAnnualReports: Story = {
  args: {
    documentsByCategory: groupByCategory(
      mockDocuments.filter(
        (doc) => doc.category === OperatorDocumentCategory.AnnualReport
      )
    ),
  },
};

export const EmptyState: Story = {
  args: {
    documentsByCategory: new Map(),
  },
};

export const SingleDocument: Story = {
  args: {
    documentsByCategory: groupByCategory([mockDocuments[0]]),
  },
};
