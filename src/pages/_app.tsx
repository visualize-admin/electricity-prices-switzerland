import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";

import { analyticsPageView } from "src/domain/analytics";
import { GraphqlProvider } from "src/graphql/context";
import { LocaleProvider } from "src/lib/use-locale";
import { useNProgress } from "src/lib/use-nprogress";
import { i18n, parseLocaleString } from "src/locales/locales";
import { fonts, theme } from "src/themes/elcom";

import "src/styles/nprogress.css";

const useMatomo = () => {
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
};

export default function App({ Component, pageProps }: AppProps) {
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
    <>
      <Head>
        {fonts.map(({ src }) => (
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
      {matomoId && !query.download && (
        <Script id="matomo">
          {`var alreadyInitialized = !!window._paq; // FIXME: this should not be necessary once https://github.com/vercel/next.js/pull/27218 is released
    if (!alreadyInitialized) {
      var _paq = window._paq = window._paq || [];
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://analytics.bit.admin.ch/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '${matomoId}']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    }
    `}
        </Script>
      )}
    </>
  );
}
