import { Box, Flex, Link } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import contentRoutes from "src/content-routes.json";
import { useLocale } from "src/lib/use-locale";
import { locales } from "src/locales/locales";

const CurrentPageLink = ({
  locale,
  ...rest
}: {
  locale: string;
  passHref?: boolean;
  children: ReactNode;
}) => {
  const { pathname, query } = useRouter();

  return <NextLink {...rest} href={{ pathname, query }} locale={locale} />;
};

export const LanguageMenu = ({ contentId }: { contentId?: string }) => {
  const currentLocale = useLocale();

  const alternates =
    contentId && contentId in contentRoutes
      ? (
          contentRoutes as {
            [k: string]: { [k: string]: { title: string; path: string } };
          }
        )[contentId]
      : undefined;

  return (
    <Flex
      component="ul"
      sx={{
        listStyle: "none",
        p: [2, 0],
        ml: [0, "auto"],
        width: ["100%", "auto"],
        bg: ["grey[300]", "transparent"],
        order: [1, 2],
        justifyContent: "flex-end",
      }}
    >
      {locales.map((locale) => {
        const alternate = alternates?.[locale];

        const linkEl = (
          <Link
            component="span"
            rel="alternate"
            hrefLang={locale}
            sx={{
              variant: "text.paragraph2",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
              p: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              color: "grey[700]",
              bg:
                locale === currentLocale
                  ? ["grey[500]", "grey[300]"]
                  : "transparent",
              ":hover": {
                color: "primary",
              },
              ":active": {
                color: "primaryActive",
              },
              ":disabled": {
                cursor: "initial",
                color: "primaryDisabled",
              },
            }}
          >
            {locale}
          </Link>
        );

        return (
          <Box component="li" key={locale} sx={{ ml: 1, p: 0 }}>
            {alternate ? (
              <NextLink href={alternate.path} passHref locale={false}>
                {linkEl}
              </NextLink>
            ) : (
              <CurrentPageLink locale={locale} passHref>
                {linkEl}
              </CurrentPageLink>
            )}
          </Box>
        );
      })}
    </Flex>
  );
};
