import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { fonts, theme } from "../src/themes/elcom";
import { C } from "vitest/dist/chunks/reporters.d.CfRkRKN2.js";

const withAppProviders: Decorator = (Story: any) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withAppProviders],
};

export default preview;
