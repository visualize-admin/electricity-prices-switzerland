import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { theme } from "../src/themes/elcom";
import "./preview.css";

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
