import { useRouter } from "next/router";
import React from "react";
import { Link as UILink } from "theme-ui";
import { Icon, IconName } from "../icons";
import { useLocale } from "../lib/use-locale";
import NextLink, { LinkProps } from "next/link";

export const HomeLink = (
  props: Omit<LinkProps, "href" | "as"> & {
    children?: React.ReactNode;
  }
) => {
  const {
    query: { id, ...query },
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
  disabled = false,
}: {
  iconName: IconName;
  title?: string;
  href: string;
  disabled?: boolean;
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
