import { NotFound } from "./not-found";
import { DesignGrid, DesignStory } from "./storybook/base-style";

import type { Meta } from "@storybook/react";

export const NotFoundStory = () => {
  return (
    <DesignStory title="Not Found 404" reference="ElCom Library (States)">
      <DesignGrid>
        <NotFound />
      </DesignGrid>
    </DesignStory>
  );
};

const meta: Meta<typeof NotFound> = {
  title: "States/NotFound",
  component: NotFoundStory,
};

export default meta;
