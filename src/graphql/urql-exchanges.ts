// This file is not the one imported, it just re-exports the types
// for typescript to pick them up, the actual implementation
// is in the .browser or .server version.
// Webpack will pick the correct one based on the environment, see next.config.ts.
/** @knipignore */
export { exchanges, ssr } from "./urql-exchanges.browser";
