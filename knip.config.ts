import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "codemods/*.js",
    "k6-load-test.ts",
    "lingui.config.js",
    "src/pages/**/*.ts",
    "src/pages/**/*.tsx",
    "src/domain/gever/output/cli.js",
    "src/domain/gever/rollup.config.js",
    "e2e/common.ts",
    "lingui.config.ts",
    "src/**/*.stories.tsx",
    // Used for debugging
    "src/components/page-props-debug.tsx",
  ],
  project: ["src/**", "scripts/**"],
  ignore: [
    "src/graphql/resolver-types.ts",
    "src/graphql/queries.ts",
    "src/locales/trans-dummy.tsx",
    // Only used for supporting lingui extract for aa translations
    "scripts/populate-aa.ts",
  ],
  tags: ["-knipignore"],

  ignoreBinaries: [
    // Used to download content, can be removed when we switch to DatoCMS
    "make",
    // Used for running file encryptions
    "dotenv",
    // Used for opening accent project in the browser
    "open",
    // Used for managing mock data, available via nix
    "duckdb",
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

    // global library to auto translate po files
    "tpo-deepl",
  ],
};
export default config;
