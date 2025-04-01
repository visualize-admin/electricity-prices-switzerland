import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    // Pages
    "src/pages/**/*.ts",

    "codemods/*.js",

    "k6-load-test.ts",

    "src/domain/gever/output/cli.js",

    "lingui.config.js",

    "src/domain/gever/rollup.config.js",
  ],
  project: ["src/**", "scripts/**"],
  ignore: ["src/graphql/resolver-types.ts", "src/graphql/queries.ts"],
  ignoreDependencies: ["eslint-config-next", "har-to-k6", "prettier"],
};
export default config;
