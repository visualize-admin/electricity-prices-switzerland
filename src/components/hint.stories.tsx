import { StoryGrid } from "src/components/storybook/story-grid";

import {
  Loading,
  LoadingIcon,
  LoadingIconInline,
  NoDataHint,
  NoContentHint,
  NoGeoDataHint,
  HintBlue,
} from "./hint";

import type { Meta } from "@storybook/react";

const meta: Meta = {
  title: "Components/Hints",
  parameters: {
    layout: "centered",
    docs: {
      page: () => <StoryGrid title={"Hints"} />,
    },
  },
  tags: ["autodocs", "e2e:autodocs-screenshot"],
};

export default meta;

export function LoadingStory() {
  return <Loading delayMs={0} />;
}

export function LoadingIconStory() {
  return <LoadingIcon />;
}

export function LoadingIconInlineStory() {
  return <LoadingIconInline />;
}

export function NoDataHintStory() {
  return <NoDataHint />;
}

export function NoContentHintStory() {
  return <NoContentHint />;
}

export function NoGeoDataHintStory() {
  return <NoGeoDataHint />;
}

export function HintBlueStory() {
  return <HintBlue iconName="infocircle">This is a hint</HintBlue>;
}
