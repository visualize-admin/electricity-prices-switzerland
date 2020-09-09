import "core-js/features/array/flat-map";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ThemeProvider } from "theme-ui";
import { I18nProvider } from "../components/i18n-context";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { catalogs, parseLocaleString } from "../locales/locales";
import { preloadFonts, theme } from "../themes/elcom";
import { analyticsPageView } from "../domain/analytics";
import NProgress from "nprogress";

import "@reach/dialog/styles.css";
import "../nprogress.css";

export default function App({ Component, pageProps }: AppProps) {
  const { query, events: routerEvents } = useRouter();
  const locale = parseLocaleString(query.locale as string);

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    const startProgress = () => NProgress.start();
    const stopProgress = () => NProgress.done();
    const handleRouteChange = (url: string) => {
      analyticsPageView(url);
      stopProgress();
    };

    routerEvents.on("routeChangeStart", startProgress);
    routerEvents.on("routeChangeError", stopProgress);
    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
      routerEvents.off("routeChangeStart", startProgress);
      routerEvents.off("routeChangeError", stopProgress);
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
        <I18nProvider language={locale} catalogs={catalogs}>
          <GraphqlProvider>
            <ThemeProvider theme={theme}>
              <Component {...pageProps} />
            </ThemeProvider>
          </GraphqlProvider>
        </I18nProvider>
      </LocaleProvider>
    </>
  );
}
