import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "codemods/*.js",
    "k6-load-test.ts",
    "lingui.config.js",
    "src/pages/**/*.ts",
    "src/domain/gever/output/cli.js",
    "src/domain/gever/rollup.config.js",
  ],
  project: ["src/**", "scripts/**"],
  ignore: ["src/graphql/resolver-types.ts", "src/graphql/queries.ts"],
  ignoreDependencies: [
    // Added automatically by next
    "eslint-config-next",

    // Used through import type
    "geojson",

    // binary called directly from script
    "har-to-k6",

    // Can be useful
    "prettier",

    // Used through dynamic import
    "swiss-maps",

    // Used through webpack loaders
    "raw-loader",
  ],
};
export default config;
