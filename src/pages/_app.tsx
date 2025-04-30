// pages/_app.tsx
import { CacheProvider, EmotionCache } from "@emotion/react";
import { Matomo } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { analyticsPageView } from "src/domain/analytics";
import createEmotionCache from "src/emotion-cache";
import { GraphqlProvider } from "src/graphql/context";
import { LocaleProvider } from "src/lib/use-locale";
import { useNProgress } from "src/lib/use-nprogress";
import { i18n, parseLocaleString } from "src/locales/locales";
import { preloadFonts, theme } from "src/themes/elcom";

import "src/styles/nprogress.css";

const clientSideEmotionCache = createEmotionCache();

export default function MyApp(
  props: AppProps & { emotionCache?: EmotionCache }
) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
  const { query, events: routerEvents, locale: routerLocale } = useRouter();
  const locale = parseLocaleString(routerLocale ?? "");

  const matomoId = useMatomo();

  useNProgress();

  // Immediately activate locale to avoid re-render
  if (i18n.locale !== locale) {
    i18n.activate(locale);
  }

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analyticsPageView(url);
    };

    const handleRouteStart = (url: string) => {
      const locale = parseLocaleString(url.slice(1));
      if (i18n.locale !== locale) {
        i18n.activate(locale);
      }
    };

    routerEvents.on("routeChangeStart", handleRouteStart);
    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
      routerEvents.off("routeChangeStart", handleRouteStart);
      routerEvents.off("routeChangeComplete", handleRouteChange);
    };
  }, [routerEvents]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        {preloadFonts.map((src) => (
          <link
            key={src}
            rel="preload"
            as="font"
            href={src}
            crossOrigin="anonymous"
          />
        ))}
      </Head>
      <LocaleProvider value={locale}>
        <I18nProvider i18n={i18n}>
          <GraphqlProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Component {...pageProps} />
            </ThemeProvider>
          </GraphqlProvider>
        </I18nProvider>
      </LocaleProvider>
      {matomoId && !query.download && <Matomo siteId={matomoId} />}
    </CacheProvider>
  );
}

// keep your useMatomo function
function useMatomo() {
  const [matomoId, setMatomoId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchMatomoId = async () => {
      try {
        const res = await fetch("/api/matomo-id").then((r) => r.json());
        setMatomoId(res.matomoId);
      } catch (e) {
        console.error(e);
      }
    };

    fetchMatomoId();
  }, []);

  return matomoId;
}
