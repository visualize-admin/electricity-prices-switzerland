import type { Preview } from "@storybook/react";
import React from "react";
import "./preview.css";
import { withAppProviders } from "./decorators";

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
