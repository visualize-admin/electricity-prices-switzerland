import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  env: (config) => ({
    ...config,
    SPARQL_ENDPOINT: process.env.SPARQL_ENDPOINT ?? "",
    SPARQL_EDITOR: process.env.SPARQL_EDITOR ?? "",
  }),
  staticDirs: [],
};
export default config;
