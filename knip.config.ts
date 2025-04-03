import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "codemods/*.js",
    "k6-load-test.ts",
    "lingui.config.js",
    "src/pages/**/*.ts",
    "src/domain/gever/output/cli.js",
    "src/domain/gever/rollup.config.js",
    "e2e/common.ts",
    "src/**/*.stories.tsx",
  ],
  project: ["src/**", "scripts/**"],
  ignore: ["src/graphql/resolver-types.ts", "src/graphql/queries.ts"],
  ignoreBinaries: [
    // Used to download content, can be removed when we switch to DatoCMS
    "make",
  ],
  ignoreUnresolved: [
    // Used in package.json:scripts:start to configure HTTP_PROXY.
    // Node can import it fine, not sure why it's reported by knip.
    '"./configure-proxy"',
  ],
  ignoreDependencies: [
    // Added automatically by next
    "eslint-config-next",

    // Used through import type
    "geojson",

    // binary called directly from script
    "har-to-k6",

    // Used through dynamic import
    "swiss-maps",

    // Used through webpack loaders
    "raw-loader",
  ],
};
export default config;
