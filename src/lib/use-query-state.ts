import { useRouter } from "next/router";
import { useCallback } from "react";

import buildEnv from "src/env/build";
import { TariffCategory } from "src/graphql/resolver-mapped-types";
import { NetworkLevel } from "src/graphql/resolver-types";

const ensureArray = (input: string | string[]): string[] =>
  Array.isArray(input) ? input : [input];
const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

const queryStateKeys = [
  "tab",

  // electricity
  "operator",
  "period",
  "municipality",
  "canton",
  "category",
  "priceComponent",
  "product",
  "download",
  "cantonsOrder",
  "view",

  // sunshine
  "viewBy",
  "typology",
  "indicator",
  "energyTariffCategory",
  "netTariffCategory",
  "networkLevel",
] as const;

const queryStateDefaults = {
  tab: "electricity",
  id: "261",
  period: buildEnv.CURRENT_PERIOD,
  category: "H4",
  priceComponent: "total",
  product: "standard",
  operator: undefined,
  municipality: undefined,
  canton: undefined,
  download: undefined,
  cantonsOrder: "median-asc",
  view: "collapsed",
  viewBy: "all_grid_operators",
  typology: "total",
  indicator: "saidi",
  energyTariffCategory: "EC2" satisfies TariffCategory,
  netTariffCategory: "NC2" satisfies TariffCategory,
  networkLevel: "NE5" satisfies NetworkLevel["id"],
} as const;

type QueryState = {
  tab: string[];

  id: string;
  operator?: string[];
  municipality?: string[];
  canton?: string[];
  period: string[];
  category: string[];
  priceComponent: string[];
  product: string[];
  download?: string[];
  cantonsOrder: string[];
  view: string[];

  // Sunshine
  viewBy: string[];
  typology: string[];
  indicator: string[];
  energyTariffCategory: string[];
  netTariffCategory: string[];
  networkLevel: string[];
};

// e.g. /de/municipality/4096?municipality=261&period=2020&period=2019
// raw query => { id: "4096", municipality: "261", period: ["2020","2019"] }
// we want??? => { id: "4096", municipality: ["261"], period: ["2020","2019"] }

export const useQueryState = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: Partial<QueryState>) => {
      const newQuery: { [k: string]: string[] } = {};

      for (const k of queryStateKeys) {
        const v = newQueryState[k];
        if (v !== undefined) {
          newQuery[k] = v;
        }
      }

      const href = {
        pathname,
        query: { ...query, ...newQuery },
      };

      replace(href, undefined, { shallow: true });
    },
    [replace, pathname, query]
  );

  const state: Partial<QueryState> = {
    id: query.id ? ensureString(query.id) : undefined,
  };

  for (const k of queryStateKeys) {
    const v = query[k] ?? queryStateDefaults[k];
    if (v !== undefined) {
      state[k] = ensureArray(v);
    }
  }

  return [state as QueryState, setState] as const;
};

export type QueryStateSingle = {
  tab: string;
  operator?: string;
  municipality?: string;
  canton?: string;
  period: string;
  category: string;
  priceComponent: string;
  product: string;
  download?: string;
  cantonsOrder: string;
  view: string;

  // Sunshine
  viewBy: string;
  typology: string;
  indicator: string;
  energyTariffCategory: string;
  netTariffCategory: string;
  networkLevel: string;
};

export const useQueryStateSingle = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: Partial<QueryStateSingle>) => {
      const newQuery: { [k: string]: string } = {};

      for (const k of queryStateKeys) {
        const v = newQueryState[k];
        if (v !== undefined) {
          newQuery[k] = v;
        }
      }

      console.log("useQueryStateSingle setState", newQuery);

      const href = {
        pathname,
        query: { ...query, ...newQuery },
      };

      replace(href, undefined, { shallow: true });
    },
    [replace, pathname, query]
  );

  const state: Partial<QueryStateSingle> = {};

  for (const k of queryStateKeys) {
    const v = query[k] ?? queryStateDefaults[k];
    if (v !== undefined) {
      state[k] = ensureString(v);
    }
  }

  return [state as QueryStateSingle, setState] as const;
};
