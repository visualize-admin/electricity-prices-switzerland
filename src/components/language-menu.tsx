import { Box, Link } from "@mui/material";
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
    <Box
      component="ul"
      sx={{
        listStyle: "none",
        p: [2, 0],
        ml: [0, "auto"],
        width: ["100%", "auto"],
        bgcolor: ["grey.300", "transparent"],
        order: [1, 2],
        justifyContent: "flex-end",
      }}
      display="flex"
    >
      {locales.map((locale) => {
        const alternate = alternates?.[locale];

        const linkEl = (
          <Link
            component="span"
            rel="alternate"
            underline="none"
            sx={{
              variant: "text.body2",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
              p: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              color: "grey.700",
              bgcolor:
                locale === currentLocale
                  ? ["grey.500", "grey.300"]
                  : "transparent",
              "&:hover": {
                color: "primary.main",
              },
              "&:active": {
                color: "primary.active",
              },
              "&:disabled": {
                cursor: "initial",
                color: "primary.disabledd",
              },
            }}
          >
            {locale}
          </Link>
        );

        return (
          <Box
            component="li"
            key={locale}
            sx={{ ml: 1, p: 0, "& a": { textDecoration: "none" } }}
          >
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
    </Box>
  );
};
