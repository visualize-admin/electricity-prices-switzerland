import type { StorybookConfig } from "@storybook/react-vite";

import path from "path";

import commonjs from "vite-plugin-commonjs";
import react from "@vitejs/plugin-react";
import { UserConfig } from "vite";
import { lingui } from "@lingui/vite-plugin";
import macrosPlugin from "vite-plugin-babel-macros";

const config: StorybookConfig = {
  viteFinal: async (config, { configType }) => {
    if (!config.resolve || !config.resolve.alias) {
      throw new Error(
        "resolve.alias should have beeen configured by storybook"
      );
    }
    type AliasOptions = Exclude<typeof config.resolve.alias, readonly any[]>;

    const resolveAlias = config.resolve.alias as AliasOptions;
    resolveAlias.src = path.resolve(__dirname, "../src");

    resolveAlias["@lingui/macro"] = path.resolve(__dirname, "./lingui-macro");

    config.define = {
      ...config.define,

      "process.version": JSON.stringify("v18.8.0"),
      "process.env": {
        FIRST_PERIOD: 2000,
        CURRENT_PERIOD: 2024,
      },
    };

    config.plugins?.push(
      commonjs({
        dynamic: {
          onFiles: (files) => files.filter((f) => f === "messages.js"),
        },
      }),
      macrosPlugin(),
      lingui()
    );
    return config;
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
