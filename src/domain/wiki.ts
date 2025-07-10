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
    "help-energy-tariffs",
    "help-fixcosts",
    "help-grid-tariffs",
    "help-municipalities-and-grid-operators-info",
    "help-network-costs",
    "help-price-comparison",
    "help-price-components",
    "help-price-distribution",
    "help-price-evolution",
    "help-product-variety",
    "help-products",
    "help-saidi",
    "help-saifi",
    "help-search-list",
    "home-banner",
    "help-net-tariffs",
    "help-operational-standards",
    "help-categories",
    "help-indicator",
    "help-typology",
    "help-network-level",
  ],
  missing: [],
} as const;

export type WikiPageSlug = (typeof wikiPageSlugs)[
  | "available"
  | "missing"][number];
