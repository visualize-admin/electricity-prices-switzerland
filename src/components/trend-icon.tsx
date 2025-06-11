import { ComponentProps } from "react";

import { Icon } from "src/icons";

type Trend = "stable" | "increasing" | "decreasing";
const iconName = {
  stable: null,
  increasing: "arrowup",
  decreasing: "arrowdown",
} as const;
export const TrendIcon: React.FC<
  { trend: Trend } & Omit<ComponentProps<typeof Icon>, "name">
> = ({ trend, ...props }) => {
  const icon = iconName[trend];
  return icon ? <Icon {...props} name={icon} /> : null;
};
