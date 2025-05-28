import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { theme } from "../src/themes/elcom";
import "./preview.css";
import { i18n } from "../src/locales/locales";
import { I18nProvider } from "@lingui/react";

const withAppProviders: Decorator = (Story: any) => {
  return (
    <div data-storybook-state="loaded">
      <I18nProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </I18nProvider>
    </div>
  );
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
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
