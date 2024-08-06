import NextLink, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Link as UILink } from "@mui/material";

import { Icon, IconName } from "../icons";

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
    // disabled={disabled}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      ml: 4,
      color: "primary",
      "&:disabled": {
        color: "primaryDisabled",
      },
      "&:hover": {
        color: "primaryHover",
      },
      "&:active": {
        color: "primaryActive",
      },
      "&:visited": {
        color: "primary",
      },
    }}
  >
    <Icon name={iconName}></Icon>
  </UILink>
);
