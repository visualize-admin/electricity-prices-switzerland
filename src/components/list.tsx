import { Trans, t } from "@lingui/macro";

import Link from "next/link";
import { useLocale } from "../lib/use-locale";
import { Flex, Link as UILink } from "@theme-ui/components";
import { useRouter } from "next/router";
import { I18n } from "@lingui/react";

export const List = () => {
  const locale = useLocale();
  const { query } = useRouter();

  return (
    <Flex
      sx={{
        width: ["auto", 320, 320],
        height: "fit-content",
        flexDirection: "column",
        justifyContent: "flex-start",
        m: 4,
        bg: "monochrome100",
        p: 5,
        pb: 6,
        zIndex: 12,
        "> button": { mt: 2 },
      }}
    >
      <Link
        href={{ pathname: `/[locale]/[municipality]/[id]`, query }}
        as={{
          pathname: `/${locale}/municipality/zürich`,
          query,
        }}
        passHref
      >
        <UILink
          sx={{
            p: 1,
            color: "primary",
            cursor: "pointer",
            ":hover": {
              color: "primaryHover",
            },
            ":active": {
              color: "primaryActive",
            },
          }}
        >
          Link to the municipality: Zürich
        </UILink>
      </Link>
    </Flex>
  );
};
