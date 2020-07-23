import { useCallback } from "react";
import { useRouter } from "next/router";
import { createDynamicRouteProps } from "../components/links";

const ensureArray = (input: string | string[]): string[] =>
  Array.isArray(input) ? input : [input];
const ensureString = (input: string | string[]): string =>
  Array.isArray(input) ? input[0] : input;

const queryStateKeys = [
  "provider",
  "period",
  "municipality",
  "canton",
  "category",
  "priceComponent",
  "product",
] as const;

const queryStateDefaults = {
  id: "261",
  period: "2020",
  category: "C1",
  priceComponent: "total",
  product: "standard",
  provider: undefined,
  municipality: "",
  canton: undefined,
} as const;

type QueryState = {
  id: string;
  provider?: string[];
  municipality?: string[];
  canton?: string[];
  period: string[];
  category: string[];
  priceComponent: string[];
  product: string[];
};

// e.g. /de/municipality/4096?municipality=261&period=2020&period=2019
// raw query => { id: "4096", municipality: "261", period: ["2020","2019"] }
// we want??? => { id: "4096", municipality: ["261"], period: ["2020","2019"] }

export const useQueryState = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: Partial<QueryState>) => {
      let newQuery: { [k: string]: string[] } = {};

      for (let k of queryStateKeys) {
        const v = newQueryState[k];
        if (v !== undefined) {
          newQuery[k] = v;
        }
      }

      const { href, as } = createDynamicRouteProps({
        pathname,
        query: { ...query, ...newQuery },
      });

      replace(href, as);
    },
    [replace, pathname, query]
  );

  let state: Partial<QueryState> = {
    id: ensureString(query.id),
  };

  for (let k of queryStateKeys) {
    const v = query[k] ?? queryStateDefaults[k];
    if (v !== undefined) {
      state[k] = ensureArray(v);
    }
  }

  return [state as QueryState, setState] as const;
};

type QueryStateSingle = {
  provider?: string;
  municipality?: string;
  canton?: string;
  period: string;
  category: string;
  priceComponent: string;
  product: string;
};

export const useQueryStateSingle = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: Partial<QueryStateSingle>) => {
      let newQuery: { [k: string]: string } = {};

      for (let k of queryStateKeys) {
        const v = newQueryState[k];
        if (v !== undefined) {
          newQuery[k] = v;
        }
      }

      const { href, as } = createDynamicRouteProps({
        pathname,
        query: { ...query, ...newQuery },
      });

      replace(href, as);
    },
    [replace, pathname, query]
  );

  let state: Partial<QueryStateSingle> = {};

  for (let k of queryStateKeys) {
    const v = query[k] ?? queryStateDefaults[k];
    if (v !== undefined) {
      state[k] = ensureString(v);
    }
  }

  return [state as QueryStateSingle, setState] as const;
};
