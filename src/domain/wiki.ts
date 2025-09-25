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
    "help-indicator",
    "help-municipalities-and-grid-operators-info",
    "help-net-tariffs",
    "help-network-costs",
    "help-network-level",
    "help-operational-standards",
    "help-price-comparison",
    "help-price-components",
    "help-price-distribution",
    "help-price-evolution",
    "help-product-variety",
    "help-products",
    "help-saidi",
    "help-saifi",
    "help-search-list",
    "help-categories",
    "help-typology",
    "home-banner"
  ],
  missing: [],
} as const;

export type WikiPageSlug = (typeof wikiPageSlugs)[
  | "available"
  | "missing"][number];
