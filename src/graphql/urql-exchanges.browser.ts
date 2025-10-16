import { truthy } from "src/lib/truthy";
import { cacheExchange, Exchange, fetchExchange, ssrExchange } from "urql";
import { delay, pipe } from "wonka";

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

// This exchange adds a delay to all operations, useful for simulating network latency in development or testing.
// It can be activated by setting `activateDelayExchange` to true.
const delayExchange: (duration: number) => Exchange =
  (duraton: number) =>
  ({ forward }) => {
    return (operations$) => {
      const operationResult$ = pipe(operations$, delay(duraton), forward);
      return operationResult$;
    };
  };

const activateDelayExchange = false;
const delayExchangeDuration = 2000; // Duration in milliseconds

export const makeExchanges = (_context: $IntentionalAny) =>
  [
    cacheExchange,
    ssr,
    activateDelayExchange ? delayExchange(delayExchangeDuration) : undefined,
    fetchExchange,
  ].filter(truthy);
