import { ComponentProps } from "react";

import { Trend } from "src/graphql/resolver-types";
import { Icon } from "src/icons";

const iconName = {
  [Trend.Stable]: null,
  [Trend.Up]: "arrowup",
  [Trend.Down]: "arrowdown",
} as const;
export const TrendIcon: React.FC<
  { trend: Trend | undefined | null } & Omit<
    ComponentProps<typeof Icon>,
    "name"
  >
> = ({ trend, ...props }) => {
  const icon = trend ? iconName[trend] : undefined;
  return icon ? <Icon {...props} name={icon} /> : null;
};
