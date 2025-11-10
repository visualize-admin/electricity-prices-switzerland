import { describe, expect, it, vi } from "vitest";

import { getLocalizedLabel } from "./translation";

// Mock the @lingui/macro t function to return message as identity function
vi.mock("@lingui/macro", () => ({
  t: vi.fn(({ message }: { message: string }) => message),
}));

describe("getLocalizedLabel", () => {
  it("should return localized labels for a list of IDs", () => {
    const testIds = [
      "collapsed-operator",
      "expanded-operator",
      "collapsed-municipality",
      "expanded-municipality",
      "standard",
      "cheapest",
      "gridusage",
      "energy",
      "charge",
      "aidfee",
      "total",
      "meteringrate",
      "annualmeteringcost",
      "productvariety-trend",
      "compliance-trend",
      "servicequality-trend",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "H7",
      "H8",
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
      "C6",
      "C7",
      "H1-long",
      "H2-long",
      "H3-long",
      "H4-long",
      "H5-long",
      "H6-long",
      "H7-long",
      "H8-long",
      "C1-long",
      "C2-long",
      "C3-long",
      "C4-long",
      "C5-long",
      "C6-long",
      "C7-long",
      "H-group",
      "C-group",
      "period",
      "category",
      "product",
      "priceComponent",
      "OperatorResult",
      "operator",
      "operators",
      "MunicipalityResult",
      "municipality",
      "municipalities",
      "CantonResult",
      "canton",
      "cantons",
      "median-asc",
      "median-desc",
      "alpha-asc",
      "alpha-desc",
      "peer-group.all-grid-operators",
      "planned",
      "unplanned",
      "franc-rule",
      "saidi",
      "saifi",
      "networkCosts",
      "netTariffs",
      "energyTariffs",
      "compliance",
      "outageInfo",
      "daysInAdvanceOutageNotification",
      "peer-group.settlement-density.high",
      "peer-group.settlement-density.medium",
      "peer-group.settlement-density.mountain",
      "peer-group.settlement-density.na",
      "peer-group.settlement-density.rural",
      "peer-group.settlement-density.tourist",
      "peer-group.energy-density.na",
      "peer-group.energy-density.high",
      "peer-group.energy-density.low",
      "network-level",
      "network-level.NE5.short",
      "network-level.NE5.long",
      "network-level.NE5.description",
      "network-level.NE6.short",
      "network-level.NE6.description",
      "network-level.NE6.long",
      "network-level.NE7.short",
      "network-level.NE7.description",
      "network-level.NE7.long",
      "sunshine.select-all",
      "sunshine.costs-and-tariffs.selected-operators",
      "power-stability.view-by",
      "power-stability.latest-year-option",
      "power-stability.progress-over-time",
      "power-stability.overall-option",
      "power-stability.overall-tooltip",
      "power-stability.ratio-option",
      "power-stability.ratio-tooltip",
      "power-stability.duration",
      "power-stability.total-option",
      "power-stability.total-tooltip",
      "power-stability.planned-option",
      "power-stability.planned-tooltip",
      "power-stability.unplanned-option",
      "power-stability.unplanned-tooltip",
      "costs-and-tariffs.view-by",
      "costs-and-tariffs.latest-year-option",
      "costs-and-tariffs.progress-over-time",
      "price-components.collapsed-content",
      "price-components.expanded-content",
      "price-components.total-content",
      "price-components.gridusage-content",
      "price-components.energy-content",
      "price-components.charge-content",
      "price-components.aidfee-content",
      "price-components.meteringrate-content",
      "selector-tab.electricity",
      "selector-tab.electricity-content",
      "selector-tab.indicators",
      "selector-tab.indicators-content",
    ] as const;

    const results = testIds.map((id) => ({
      id,
      label: getLocalizedLabel({ id }),
    }));

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "id": "collapsed-operator",
          "label": "Group municipalities",
        },
        {
          "id": "expanded-operator",
          "label": "Show individual municipalities",
        },
        {
          "id": "collapsed-municipality",
          "label": "Grouping network operators",
        },
        {
          "id": "expanded-municipality",
          "label": "Show individual network operators",
        },
        {
          "id": "standard",
          "label": "Standard",
        },
        {
          "id": "cheapest",
          "label": "Cheapest",
        },
        {
          "id": "gridusage",
          "label": "Grid usage",
        },
        {
          "id": "energy",
          "label": "Energy",
        },
        {
          "id": "charge",
          "label": "Charges to the community",
        },
        {
          "id": "aidfee",
          "label": "Grid surcharge pursuant to Art. 35 EnG",
        },
        {
          "id": "total",
          "label": "Total",
        },
        {
          "id": "meteringrate",
          "label": "Metering Rate",
        },
        {
          "id": "annualmeteringcost",
          "label": "Annual Metering Cost",
        },
        {
          "id": "productvariety-trend",
          "label": "Comparison of eco-friendly product diversity",
        },
        {
          "id": "compliance-trend",
          "label": "Comparison of francs per invoice recipient",
        },
        {
          "id": "servicequality-trend",
          "label": "Comparison of advance notice periods for planned outages",
        },
        {
          "id": "H1",
          "label": "H1",
        },
        {
          "id": "H2",
          "label": "H2",
        },
        {
          "id": "H3",
          "label": "H3",
        },
        {
          "id": "H4",
          "label": "H4",
        },
        {
          "id": "H5",
          "label": "H5",
        },
        {
          "id": "H6",
          "label": "H6",
        },
        {
          "id": "H7",
          "label": "H7",
        },
        {
          "id": "H8",
          "label": "H8",
        },
        {
          "id": "C1",
          "label": "C1",
        },
        {
          "id": "C2",
          "label": "C2",
        },
        {
          "id": "C3",
          "label": "C3",
        },
        {
          "id": "C4",
          "label": "C4",
        },
        {
          "id": "C5",
          "label": "C5",
        },
        {
          "id": "C6",
          "label": "C6",
        },
        {
          "id": "C7",
          "label": "C7",
        },
        {
          "id": "H1-long",
          "label": "H1 - 2-Room apartment with induction stove",
        },
        {
          "id": "H2-long",
          "label": "H2 - 4-room apartment with electric stove",
        },
        {
          "id": "H3-long",
          "label": "H3 - 4-room apartment with electric stove and electric boiler",
        },
        {
          "id": "H4-long",
          "label": "H4 - 5-room apartment with electric stove and dryer",
        },
        {
          "id": "H5-long",
          "label": "H5 - 5-room single-family house with electric stove, electric boiler, and dryer",
        },
        {
          "id": "H6-long",
          "label": "H6 - 5-room single-family house with electric resistance heating",
        },
        {
          "id": "H7-long",
          "label": "H7 - 5-room single-family house with heat pump for heating",
        },
        {
          "id": "H8-long",
          "label": "H8 - Large, highly electrified condominium",
        },
        {
          "id": "C1-long",
          "label": "C1 - Small business (<8 kW)",
        },
        {
          "id": "C2-long",
          "label": "C2 - Small business (<15 kW)",
        },
        {
          "id": "C3-long",
          "label": "C3 - Medium business (<50 kW)",
        },
        {
          "id": "C4-long",
          "label": "C4 - Large business (<150 kW, low voltage)",
        },
        {
          "id": "C5-long",
          "label": "C5 - Large business (<150 kW, medium voltage)",
        },
        {
          "id": "C6-long",
          "label": "C6 - Large business (<400 kW, medium voltage)",
        },
        {
          "id": "C7-long",
          "label": "C7 - Large business (<1,630 kW, medium voltage)",
        },
        {
          "id": "H-group",
          "label": "Households",
        },
        {
          "id": "C-group",
          "label": "Commercial and industrial companies",
        },
        {
          "id": "period",
          "label": "Year",
        },
        {
          "id": "category",
          "label": "Category",
        },
        {
          "id": "product",
          "label": "Product",
        },
        {
          "id": "priceComponent",
          "label": "Price component",
        },
        {
          "id": "OperatorResult",
          "label": "Network operator",
        },
        {
          "id": "operator",
          "label": "Network operator",
        },
        {
          "id": "operators",
          "label": "Network operator",
        },
        {
          "id": "MunicipalityResult",
          "label": "Municipality",
        },
        {
          "id": "municipality",
          "label": "Municipality",
        },
        {
          "id": "municipalities",
          "label": "Municipalities",
        },
        {
          "id": "CantonResult",
          "label": "Canton",
        },
        {
          "id": "canton",
          "label": "Canton",
        },
        {
          "id": "cantons",
          "label": "Cantons",
        },
        {
          "id": "median-asc",
          "label": "Median ascending",
        },
        {
          "id": "median-desc",
          "label": "Median descending",
        },
        {
          "id": "alpha-asc",
          "label": "Alphabetically ascending",
        },
        {
          "id": "alpha-desc",
          "label": "Alphabetically descending",
        },
        {
          "id": "peer-group.all-grid-operators",
          "label": "All grid operators",
        },
        {
          "id": "planned",
          "label": "Planned",
        },
        {
          "id": "unplanned",
          "label": "Unplanned",
        },
        {
          "id": "franc-rule",
          "label": "Franc rule",
        },
        {
          "id": "saidi",
          "label": "Power Outage Duration (SAIDI)",
        },
        {
          "id": "saifi",
          "label": "Power Outage Frequency (SAIFI)",
        },
        {
          "id": "networkCosts",
          "label": "Network costs",
        },
        {
          "id": "netTariffs",
          "label": "Net tariffs",
        },
        {
          "id": "energyTariffs",
          "label": "Energy tariffs",
        },
        {
          "id": "compliance",
          "label": "Compliance",
        },
        {
          "id": "outageInfo",
          "label": "Outage information",
        },
        {
          "id": "daysInAdvanceOutageNotification",
          "label": "Days in advance outage notification",
        },
        {
          "id": "peer-group.settlement-density.high",
          "label": "High settlement density",
        },
        {
          "id": "peer-group.settlement-density.medium",
          "label": "Medium settlement density",
        },
        {
          "id": "peer-group.settlement-density.mountain",
          "label": "Mountain region",
        },
        {
          "id": "peer-group.settlement-density.na",
          "label": "Not specified",
        },
        {
          "id": "peer-group.settlement-density.rural",
          "label": "Rural settlement density",
        },
        {
          "id": "peer-group.settlement-density.tourist",
          "label": "Tourism",
        },
        {
          "id": "peer-group.energy-density.na",
          "label": "Not specified",
        },
        {
          "id": "peer-group.energy-density.high",
          "label": "High energy density",
        },
        {
          "id": "peer-group.energy-density.low",
          "label": "Low energy density",
        },
        {
          "id": "network-level",
          "label": "Network level",
        },
        {
          "id": "network-level.NE5.short",
          "label": "NE5",
        },
        {
          "id": "network-level.NE5.long",
          "label": "High voltage NE5",
        },
        {
          "id": "network-level.NE5.description",
          "label": "At Network Level NE5",
        },
        {
          "id": "network-level.NE6.short",
          "label": "NE6",
        },
        {
          "id": "network-level.NE6.description",
          "label": "At Network Level NE6",
        },
        {
          "id": "network-level.NE6.long",
          "label": "Medium voltage NE6",
        },
        {
          "id": "network-level.NE7.short",
          "label": "NE7",
        },
        {
          "id": "network-level.NE7.description",
          "label": "At Network Level NE7",
        },
        {
          "id": "network-level.NE7.long",
          "label": "Low voltage NE7",
        },
        {
          "id": "sunshine.select-all",
          "label": "Select All",
        },
        {
          "id": "sunshine.costs-and-tariffs.selected-operators",
          "label": "Selected network operators",
        },
        {
          "id": "power-stability.view-by",
          "label": "View By",
        },
        {
          "id": "power-stability.latest-year-option",
          "label": "Latest year",
        },
        {
          "id": "power-stability.progress-over-time",
          "label": "Progress over time",
        },
        {
          "id": "power-stability.overall-option",
          "label": "Overall",
        },
        {
          "id": "power-stability.overall-tooltip",
          "label": "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
        },
        {
          "id": "power-stability.ratio-option",
          "label": "Ratio",
        },
        {
          "id": "power-stability.ratio-tooltip",
          "label": "Shows the ratio of unplanned outages to total outages, providing insight into the stability of the power supply.",
        },
        {
          "id": "power-stability.duration",
          "label": "Duration",
        },
        {
          "id": "power-stability.total-option",
          "label": "Total",
        },
        {
          "id": "power-stability.total-tooltip",
          "label": "Shows the total outage duration per operator, combining planned and unplanned outages for direct comparison.",
        },
        {
          "id": "power-stability.planned-option",
          "label": "Planned",
        },
        {
          "id": "power-stability.planned-tooltip",
          "label": "Shows only planned outages, which are scheduled maintenance or upgrades.",
        },
        {
          "id": "power-stability.unplanned-option",
          "label": "Unplanned",
        },
        {
          "id": "power-stability.unplanned-tooltip",
          "label": "Shows only unplanned outages, which are unexpected interruptions.",
        },
        {
          "id": "costs-and-tariffs.view-by",
          "label": "View By",
        },
        {
          "id": "costs-and-tariffs.latest-year-option",
          "label": "Latest year",
        },
        {
          "id": "costs-and-tariffs.progress-over-time",
          "label": "Progress over time",
        },
        {
          "id": "price-components.collapsed-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.expanded-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.total-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.gridusage-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.energy-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.charge-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.aidfee-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "price-components.meteringrate-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "selector-tab.electricity",
          "label": "Electricity Tariffs",
        },
        {
          "id": "selector-tab.electricity-content",
          "label": "Lorem ipsum",
        },
        {
          "id": "selector-tab.indicators",
          "label": "Indicators",
        },
        {
          "id": "selector-tab.indicators-content",
          "label": "Lorem ipsum",
        },
      ]
    `);
  });

  it("should return the original ID for unknown IDs", () => {
    const unknownId = "unknown-id";
    const result = getLocalizedLabel({ id: unknownId as $IntentionalAny });

    expect(result).toBe(unknownId);
  });

  it("should handle empty string ID", () => {
    const result = getLocalizedLabel({ id: "" as $IntentionalAny });

    expect(result).toBe("");
  });
});
