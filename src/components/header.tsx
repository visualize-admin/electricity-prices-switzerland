import { TopBar } from "@interactivethings/swiss-federal-ci/dist/components";
import { Header as SwissFederalCiHeader } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { Box, NativeSelect } from "@mui/material";
import { useRouter } from "next/router";

import contentRoutes from "src/content-routes.json";
import { useLocale } from "src/lib/use-locale";
import { useResizeObserver } from "src/lib/use-resize-observer";
import { locales } from "src/locales/locales";

export const Header = ({
  contentId,
  hideLogo,
  extendTopBar,
}: {
  contentId?: string;
  hideLogo?: boolean;
  extendTopBar?: boolean;
}) => {
  const currentLocale = useLocale();
  const { push, pathname, query } = useRouter();
  const [ref] = useResizeObserver<HTMLDivElement>();

  const alternates =
    contentId && contentId in contentRoutes
      ? (
          contentRoutes as {
            [k: string]: { [k: string]: { title: string; path: string } };
          }
        )[contentId]
      : undefined;

  return (
    <div ref={ref} style={{ zIndex: 1 }}>
      <TopBar
        ContentWrapperProps={{
          sx: {
            justifyContent: "space-between",
            ...(extendTopBar
              ? { maxWidth: "100% !important", px: "16px !important" }
              : {}),
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={3} marginLeft="auto">
          <NativeSelect
            value={currentLocale}
            onChange={(e) => {
              const locale = e.currentTarget.value;
              const alternate = alternates?.[locale];

              if (alternate) {
                push(alternate.path, undefined, { locale: false });
              } else {
                push({ pathname, query }, undefined, { locale });
              }
            }}
            sx={{
              padding: 0,
              border: "none !important",
              backgroundColor: "transparent",
              color: "white !important",
              textDecoration: "none !important",
              "&:before": {
                border: "none !important",
              },
              "&:after": {
                border: "none !important",
              },
              "&:hover": {
                textDecoration: "none !important",
                backgroundColor: "transparent",
                color: (t) => `${t.palette.cobalt[100]} !important`,
              },
            }}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </NativeSelect>
        </Box>
      </TopBar>
      {hideLogo ? null : (
        <SwissFederalCiHeader
          longTitle="Federal Electricity Commission ElCom"
          shortTitle="ElCom"
          rootHref="/"
          sx={{ backgroundColor: "white" }}
        />
      )}
    </div>
  );
};
