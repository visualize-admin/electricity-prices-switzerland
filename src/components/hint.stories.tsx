import { Box } from "@mui/material";

import { StoryGrid } from "src/components/storybook/story-grid";

import {
  Loading,
  LoadingIcon,
  LoadingIconInline,
  NoDataHint,
  NoContentHint,
  Hint,
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
  tags: ["autodocs", "e2e:autodocs-screenshot", "e2e:no-wait-for-loading-icon"],
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

export function HintStory() {
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Hint severity="info">This is an info hint</Hint>
      <Hint severity="success">This is a success hint</Hint>
      <Hint severity="warning">This is a warning hint</Hint>
      <Hint severity="error" onRemove={() => {}}>
        This is an error hint
      </Hint>
    </Box>
  );
}
