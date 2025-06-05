import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  webpackFinal: (config) => {
    if (config.resolve === undefined) {
      config.resolve = {};
    }
    config.resolve.alias = {
      // Mock the @duckdb/node-api package to avoid issues with Storybook
      "@duckdb/node-api": require.resolve("../mocks/duckdb-mock.js"),
    };
    return config;
  },
  env: (config) => ({
    ...config,
    SPARQL_ENDPOINT: process.env.SPARQL_ENDPOINT ?? "",
    SPARQL_EDITOR: process.env.SPARQL_EDITOR ?? "",
  }),
  staticDirs: [],
};
export default config;
