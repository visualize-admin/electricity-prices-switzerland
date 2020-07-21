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

type QueryState = {
  id?: string;
  period?: string[];
  provider?: string[];
  municipality?: string[];
  canton?: string[];
  category?: string[];
  priceComponent?: string[];
  product?: string[];
};

// e.g. /de/municipality/4096?municipality=261&period=2020&period=2019
// raw query => { id: "4096", municipality: "261", period: ["2020","2019"] }
// we want??? => { id: "4096", municipality: ["261"], period: ["2020","2019"] }

export const useQueryState = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: QueryState) => {
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

  let state: QueryState = {
    id: ensureString(query.id),
  }; // <- somehow we get this from router.query
  // -> Use the first param

  for (let k of queryStateKeys) {
    state[k] = ensureArray(query[k]);
  }

  return [state, setState] as const;
};

type QueryStateSingle = {
  provider?: string;
  period?: string;
  municipality?: string;
  canton?: string;
  category?: string;
  priceComponent?: string;
  product?: string;
};

export const useQueryStateSingle = () => {
  const { query, replace, pathname } = useRouter();

  const setState = useCallback(
    (newQueryState: QueryStateSingle) => {
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

  let state: QueryStateSingle = {}; // <- somehow we get this from router.query
  // -> Use the first param

  for (let k of queryStateKeys) {
    state[k] = ensureString(query[k]);
  }

  return [state, setState] as const;
};
