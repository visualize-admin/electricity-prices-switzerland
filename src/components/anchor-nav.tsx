import { Link, LinkProps, Stack, Typography } from "@mui/material";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { ReactElement } from "react";
type AnchorNavProps = {
  label: string;
  tag?: ReactElement;
  active?: boolean;
  disabled?: boolean;
  size?: "sm" | "lg";
  icon?: ReactElement;
} & Omit<LinkProps, "href"> &
  Pick<NextLinkProps, "href">;

export const AnchorNav = (props: AnchorNavProps) => {
  const {
    label,
    tag,
    active,
    disabled,
    size = "lg",
    icon,
    ...restProps
  } = props;

  return (
    <Link component={NextLink} {...restProps}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{
          "&:hover": {
            backgroundColor: disabled ? "transparent" : "secondary.50",
          },
          cursor: disabled ? "not-allowed" : "pointer",
          borderLeftWidth: active ? 4 : 0,
          borderLeftStyle: active ? "solid" : "none",
          borderLeftColor: active ? "primary.main" : "transparent",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome.200",
          color: disabled ? "secondary.200" : "text.primary",
          px: size === "lg" ? 5 : 3,
          py: size === "lg" ? 5 : 4,
        }}
      >
        <Typography
          variant="body2"
          lineHeight={"150%"}
          sx={{
            fontFeatureSettings: "'liga' off, 'clig' off",
          }}
        >
          {label}
        </Typography>
        {(tag || icon) && (
          <Stack spacing={2} direction={"row"} alignItems={"center"}>
            {tag}
            {icon}
          </Stack>
        )}
      </Stack>
    </Link>
  );
};
