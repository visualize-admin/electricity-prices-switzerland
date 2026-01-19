import { cacheExchange, fetchExchange, ssrExchange } from "urql";

export const ssr = ssrExchange({
  isClient: false,
  initialState: {},
});

/** @knipignore */
export const makeExchanges = () => [cacheExchange, ssr, fetchExchange];
