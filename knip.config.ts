import { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "codemods/*.js",
    "k6-load-test.ts",
    "lingui.config.js",
    "src/pages/**/*.ts",
    "src/pages/**/*.tsx",
    "src/domain/gever/rollup.config.js",
    "src/e2e/*.ts",
    "src/**/*.stories.tsx",
    // Used for debugging
    "src/components/page-props-debug.tsx",
    // Used for PR creation
    "scripts/pr-content.ts",
  ],
  project: ["src/**", "scripts/**"],
  ignore: [
    "src/graphql/resolver-types.ts",
    "src/graphql/queries.ts",
  ],
  tags: ["-knipignore"],

  ignoreBinaries: [
    // Used for opening accent project in the browser
    "open",
    // Used to run security vulnerability scan, available via nix
    "trivy",
  ],
  ignoreUnresolved: [
    // Used in package.json:scripts:start to configure HTTP_PROXY.
    // Node can import it fine, not sure why it's reported by knip.
    '"./configure-proxy"',
  ],
  ignoreDependencies: [
    // Added automatically by next
    "eslint-config-next",

    // binary called directly from script
    "har-to-k6",

    // Used through dynamic import
    "swiss-maps",

    // Used through webpack loaders
    "raw-loader",

    // global library to auto translate po files
    "tpo-deepl",

    // Used in next config experimental.swcPlugins
    "@lingui/swc-plugin",

    // Used as formatter/linter via CLI
    "@biomejs/biome",
  ],
};
export default config;
