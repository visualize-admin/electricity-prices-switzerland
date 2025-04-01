import NextLink, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React from "react";

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
