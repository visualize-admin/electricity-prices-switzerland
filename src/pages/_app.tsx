// pages/_app.tsx
import { CacheProvider, EmotionCache } from "@emotion/react";
import { Matomo } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { t } from "@lingui/macro";
import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { analyticsPageView } from "src/domain/analytics";
import createEmotionCache from "src/emotion-cache";
import { getClientRuntimeEnv } from "src/env/client";
import { GraphqlProvider } from "src/graphql/context";
import { LocaleProvider } from "src/lib/use-locale";
import { useNProgress } from "src/lib/use-nprogress";
import { i18n as appI18n, parseLocaleString } from "src/locales/locales";
import { preloadFonts, theme } from "src/themes/elcom";
import { useRuntimeFlags } from "src/utils/flags";

import "src/styles/nprogress.css";

const clientSideEmotionCache = createEmotionCache();

export default function App(props: AppProps & { emotionCache?: EmotionCache }) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
  const {
    query,
    events: routerEvents,
    locale: routerLocale,
    asPath,
  } = useRouter();
  const locale = parseLocaleString(routerLocale ?? "");

  const matomoId = useMatomo();

  useNProgress();
  // Load runtime flags from server early in app lifecycle
  useRuntimeFlags();

  // Immediately activate locale to avoid re-render
  if (appI18n.locale !== locale) {
    appI18n.activate(locale);
  }

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analyticsPageView(url);
    };

    const handleRouteStart = (url: string) => {
      const locale = parseLocaleString(url.slice(1));
      if (appI18n.locale !== locale) {
        appI18n.activate(locale);
      }
    };

    routerEvents.on("routeChangeStart", handleRouteStart);
    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
      routerEvents.off("routeChangeStart", handleRouteStart);
      routerEvents.off("routeChangeComplete", handleRouteChange);
    };
  }, [routerEvents]);

  const clientRuntimeEnv = getClientRuntimeEnv();

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title key="title">strompreis.elcom.admin.ch/</title>
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={t({
            id: "app.meta.title",
            message: "Electricity tariffs in Switzerland",
          })}
        />
        <meta
          property="og:description"
          content={t({
            id: "app.meta.description",
            message:
              "Detailed price analyses of cantons, municipalities and grid operators.",
          })}
        />
        {clientRuntimeEnv ? (
          <>
            <meta
              property="og:image"
              content={`${clientRuntimeEnv.PUBLIC_URL}/og-image.jpg`}
            />
            <meta
              property="og:url"
              content={`${clientRuntimeEnv.PUBLIC_URL}${asPath}`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:image"
              content={`${clientRuntimeEnv.PUBLIC_URL}/og-image.jpg`}
            />
          </>
        ) : null}
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
        <I18nProvider i18n={appI18n}>
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
