/**
 * Use `bun wiki-content:update-types` to update this variable
 */

export const wikiPageSlugs = {
  available: [
    "help-calculation",
    "help-canton-comparison",
    "help-categories",
    "help-compliance",
    "help-download-raw-data",
    "help-dynamic-tariffs",
    "help-energy-tariffs",
    "help-fixcosts",
    "help-indicator",
    "help-municipalities-and-grid-operators-info",
    "help-net-tariffs",
    "help-network-costs",
    "help-network-level",
    "help-peer-group",
    "help-price-comparison",
    "help-price-components",
    "help-price-distribution",
    "help-price-evolution",
    "help-products",
    "help-saidi-saifi-type",
    "help-saidi",
    "help-saifi",
    "help-search-list",
    "help-service-quality",
    "help-year-electricity",
    "help-year-indicators",
    "help-outageInfo",
    "home-banner",
  ],
  missing: ["help-outageInfo"],
} as const;

export type WikiPageSlug = (typeof wikiPageSlugs)[
  | "available"
  | "missing"][number];
