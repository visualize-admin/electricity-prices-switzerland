import NextLink, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";

export const MapLink = forwardRef<HTMLAnchorElement>(
  (
    props: Omit<LinkProps, "href" | "as"> & {
      children?: React.ReactNode;
    },
    ref
  ) => {
    const {
      query: { id: _id, ...query },
    } = useRouter();

    return (
      <NextLink
        {...props}
        ref={ref}
        href={{
          pathname: "/map",
          query,
        }}
      />
    );
  }
);
