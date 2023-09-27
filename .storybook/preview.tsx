import type { Preview } from "@storybook/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../src/themes/elcom";

import React from "react";

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
      /** @ts-ignore */
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        {/** @ts-ignore */}
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
