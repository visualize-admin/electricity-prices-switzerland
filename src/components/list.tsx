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
      <I18n>
        {({ i18n }) => {
          const localizedMunicipality = {
            de: i18n._(t("entity.municipality")`gemeinde`),
            fr: i18n._(t("entity.municipality")`commune`),
            it: i18n._(t("entity.municipality")`comune`),
          };
          return (
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
                  p: 2,
                  bg: "primary",
                  color: "monochrome100",
                  cursor: "pointer",
                  ":hover": {
                    bg: "primaryHover",
                  },
                  ":active": {
                    bg: "primaryActive",
                  },
                }}
              >
                Link to the municipality: Zürich
              </UILink>
            </Link>
          );
        }}
      </I18n>
    </Flex>
  );
};
