import { cacheExchange, fetchExchange, ssrExchange } from "urql";

declare global {
  interface Window {
    // __URQL_DATA__ is used to store the initial state for SSR
    __URQL_DATA__: Record<string, any>;
  }
}

/** @knipignore */
export const ssr = ssrExchange({
  isClient: true,
  initialState: typeof window !== "undefined" ? window.__URQL_DATA__ || {} : {},
});

export const exchanges = [cacheExchange, ssr, fetchExchange];
