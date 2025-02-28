import { Link as UILink } from "@mui/material";
import NextLink, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { Icon, IconName } from "src/icons";

export const HomeLink = (
  props: Omit<LinkProps, "href" | "as"> & {
    children?: React.ReactNode;
  }
) => {
  const {
    query: { id: _id, ...query },
  } = useRouter();

  return (
    <NextLink
      {...props}
      href={{
        pathname: "/",
        query,
      }}
    />
  );
};

export const IconLink = ({
  iconName,
  href,
  title,
}: {
  iconName: IconName;
  title?: string;
  href: string;
}) => (
  <UILink
    title={title}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      ml: 4,
      color: "primary.main",
      "&:disabled": {
        color: "primary.disabledd",
      },
      "&:hover": {
        color: "primary.hover",
      },
      "&:active": {
        color: "primary.active",
      },
      "&:visited": {
        color: "primary.main",
      },
    }}
  >
    <Icon name={iconName}></Icon>
  </UILink>
);
