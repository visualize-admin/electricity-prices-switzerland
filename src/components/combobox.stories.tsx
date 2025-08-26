import { useState } from "react";

import { Combobox, ComboboxItem, MultiCombobox } from "./combobox";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Combobox> = {
  title: "ui/Combobox",
  component: Combobox,
  tags: ["autodocs", "e2e:autodocs-screenshot"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

// Year Selection Story
export const YearSelection: Story = {
  render: () => {
    const [selectedYear, setSelectedYear] = useState("2023");
    const years = ["2019", "2020", "2021", "2022", "2023", "2024"];

    return (
      <div style={{ width: "300px" }}>
        <Combobox
          id="year-selection"
          label="Select Year"
          items={years}
          selectedItem={selectedYear}
          setSelectedItem={setSelectedYear}
        />
      </div>
    );
  },
};

// Municipality Selection Story
export const MunicipalitySelection: Story = {
  render: () => {
    const [selectedMunicipality, setSelectedMunicipality] = useState("zurich");
    const municipalities = [
      { type: "header", title: "Popular Cities" },
      "zurich",
      "geneva",
      "basel",
      { type: "header", title: "Other Cities" },
      "bern",
      "lausanne",
      "winterthur",
      "lucerne",
      "st-gallen",
    ] satisfies ComboboxItem[];

    const getLabel = (id: string) => {
      const labels: Record<string, string> = {
        zurich: "Zürich",
        geneva: "Geneva",
        basel: "Basel",
        bern: "Bern",
        lausanne: "Lausanne",
        winterthur: "Winterthur",
        lucerne: "Lucerne",
        "st-gallen": "St. Gallen",
      };
      return labels[id] || id;
    };

    return (
      <div style={{ width: "300px" }}>
        <Combobox
          id="municipality-selection"
          label="Select Municipality"
          items={municipalities}
          selectedItem={selectedMunicipality}
          setSelectedItem={setSelectedMunicipality}
          getItemLabel={getLabel}
          infoDialogSlug="help-municipalities-and-grid-operators-info"
        />
      </div>
    );
  },
};

// Usage Category Selection Story
export const UsageCategorySelection: Story = {
  render: () => {
    const [selectedCategory, setSelectedCategory] = useState("H1");
    const categories = [
      { type: "header", title: "Household Categories" },
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "H7",
      { type: "header", title: "Business Categories" },
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
      "C6",
    ] satisfies ComboboxItem[];

    const getCategoryLabel = (category: string) => {
      const descriptions: Record<string, string> = {
        H1: "H1 - Single apartment with 2 rooms",
        H2: "H2 - Apartment with 4 rooms",
        H3: "H3 - Single family house",
        H4: "H4 - Large family house",
        H5: "H5 - Small business",
        H6: "H6 - Medium business",
        H7: "H7 - Large business",
        C1: "C1 - Small commercial",
        C2: "C2 - Medium commercial",
        C3: "C3 - Large commercial",
        C4: "C4 - Small industrial",
        C5: "C5 - Medium industrial",
        C6: "C6 - Large industrial",
      };
      return descriptions[category] || category;
    };

    return (
      <div style={{ width: "400px" }}>
        <Combobox
          id="usage-category-selection"
          label="Select Usage Category"
          items={categories}
          selectedItem={selectedCategory}
          setSelectedItem={setSelectedCategory}
          getItemLabel={getCategoryLabel}
        />
      </div>
    );
  },
};

// Multi-Selection Example
export const MultiSelection: StoryObj<typeof MultiCombobox> = {
  render: () => {
    const [selectedMunicipalities, setSelectedMunicipalities] = useState([
      "zurich",
      "bern",
    ]);
    const municipalities = [
      "zurich",
      "geneva",
      "basel",
      "bern",
      "lausanne",
      "winterthur",
      "lucerne",
      "st-gallen",
    ];

    const getLabel = (id: string) => {
      const labels: Record<string, string> = {
        zurich: "Zürich",
        geneva: "Geneva",
        basel: "Basel",
        bern: "Bern",
        lausanne: "Lausanne",
        winterthur: "Winterthur",
        lucerne: "Lucerne",
        "st-gallen": "St. Gallen",
      };
      return labels[id] || id;
    };

    return (
      <div style={{ width: "400px" }}>
        <MultiCombobox
          id="municipality-multi-selection"
          label="Select Municipalities for Comparison"
          items={municipalities}
          selectedItems={selectedMunicipalities}
          setSelectedItems={setSelectedMunicipalities}
          getItemLabel={getLabel}
          minSelectedItems={1}
        />
      </div>
    );
  },
};

// Disabled state example
export const DisabledCombobox: Story = {
  render: () => {
    const [selectedYear, setSelectedYear] = useState("2023");
    const years = ["2019", "2020", "2021", "2022", "2023", "2024"];

    return (
      <div style={{ width: "300px" }}>
        <Combobox
          id="disabled-year-selection"
          label="Select Year (Disabled)"
          items={years}
          selectedItem={selectedYear}
          setSelectedItem={setSelectedYear}
          disabled={true}
        />
      </div>
    );
  },
};

// Error state example
export const ErrorCombobox: Story = {
  render: () => {
    const [selectedYear, setSelectedYear] = useState("2023");
    const years = ["2019", "2020", "2021", "2022", "2023", "2024"];

    return (
      <div style={{ width: "300px" }}>
        <Combobox
          id="error-year-selection"
          label="Select Year (Error State)"
          items={years}
          selectedItem={selectedYear}
          setSelectedItem={setSelectedYear}
          error={true}
        />
      </div>
    );
  },
};
