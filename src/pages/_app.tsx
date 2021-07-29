import "core-js/features/array/flat-map";
import { I18nProvider } from "@lingui/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";
import { ThemeProvider } from "theme-ui";
import { analyticsPageView } from "../domain/analytics";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { useNProgress } from "../lib/use-nprogress";
import { i18n, parseLocaleString } from "../locales/locales";
import "../styles/nprogress.css";
import "../styles/reach-dialog.css";
import { preloadFonts, theme } from "../themes/elcom";

export default function App({ Component, pageProps }: AppProps) {
  const { query, events: routerEvents, locale: routerLocale } = useRouter();
  const locale = parseLocaleString(routerLocale ?? "");

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
        {preloadFonts.map((src) => (
          <link
            key={src}
            rel="preload"
            href={src}
            as="font"
            crossOrigin="anonymous"
          />
        ))}
      </Head>
      <LocaleProvider value={locale}>
        <I18nProvider i18n={i18n}>
          <GraphqlProvider>
            <ThemeProvider theme={theme}>
              <Component {...pageProps} />
            </ThemeProvider>
          </GraphqlProvider>
        </I18nProvider>
      </LocaleProvider>
      {process.env.MATOMO_ID && !query.download && (
        <Script>
          {`var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://analytics.bit.admin.ch/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '${process.env.MATOMO_ID}']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();`}
        </Script>
      )}
    </>
  );
}
