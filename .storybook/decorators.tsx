import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Decorator } from "@storybook/react";
import React from "react";
import { i18n } from "../src/locales/locales";
import { theme } from "../src/themes/elcom";
import "./preview.css";
import { Client, Provider } from "urql";

export const withAppProviders: Decorator = (Story: any) => {
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
