import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    // Pages
    "src/pages/**/*.ts",

    "codemods/*.js",

    "src/domain/gever/output/cli.js",

    "lingui.config.js",
  ],
  project: ["src/**", "scripts/**"],
  ignore: ["src/graphql/resolver-types.ts", "src/graphql/queries.ts"],
};
export default config;
