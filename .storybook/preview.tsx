import type { Preview } from "@storybook/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../src/themes/elcom";

import React from "react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "../src/locales/locales";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <I18nProvider i18n={i18n}>
        {/** @ts-ignore */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
          {/** @ts-ignore */}
          <Story />
        </ThemeProvider>
      </I18nProvider>
    ),
  ],
};

export default preview;
