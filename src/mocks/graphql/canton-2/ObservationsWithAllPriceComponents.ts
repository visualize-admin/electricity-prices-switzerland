// Recorded from /canton/2?period=2027&category=H3&product=cheapest
// by `pnpm mocks:graphql`. Re-record instead of editing by hand.
import type { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";

/** @knipignore */
export const variables = {
  filters: {
    canton: ["2"],
    category: ["H3"],
    period: ["2027"],
    product: ["cheapest"],
  },
  locale: "en",
  observationKind: "Canton",
  operatorIds: [],
};

export const data: ObservationsWithAllPriceComponentsQuery = {
  __typename: "Query",
  operators: [],
  observations: null,
  cantonMedianObservations: [
    {
      period: "2027",
      canton: "2",
      cantonLabel: "Bern",
      category: "H3",
      aidfee: 2.3,
      charge: 1.5,
      gridusage: 11.913,
      energy: 6.967,
      total: 24.591,
      __typename: "CantonMedianObservation",
    },
  ],
};
