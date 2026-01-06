import { ComponentProps } from "react";
import { makeStyles } from "tss-react/mui";

import { Trend } from "src/graphql/resolver-types";
import { Icon } from "src/icons";

const useStyles = makeStyles()(() => ({
  icon: {
    width: 12,
    height: 12,
  },
}));

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
  const { classes, cx } = useStyles();
  const icon = trend ? iconName[trend] : undefined;

  return icon ? (
    <Icon
      {...props}
      name={icon}
      className={cx(classes.icon, props.className)}
      viewBox="4 4 16 16"
      width="12"
      height="12"
    />
  ) : null;
};
