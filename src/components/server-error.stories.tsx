import { ServerError } from "./server-error";
import { DesignGrid, DesignStory } from "./storybook/base-style";

import type { Meta } from "@storybook/react";

export const ServerErrorStory = () => {
  return (
    <DesignStory title="Server Errors 500" reference="ElCom Library (States)">
      <DesignGrid>
        <ServerError />
      </DesignGrid>
    </DesignStory>
  );
};

const meta: Meta<typeof ServerError> = {
  title: "States/ServerError",
  component: ServerErrorStory,
};

export default meta;
