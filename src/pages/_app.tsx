import "@reach/dialog/styles.css";
import "core-js/features/array/flat-map";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ThemeProvider } from "theme-ui";
import { I18nProvider } from "../components/i18n-context";
import { analyticsPageView } from "../domain/analytics";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { useNProgress } from "../lib/use-nprogress";
import { catalogs, parseLocaleString } from "../locales/locales";
import "../nprogress.css";
import { preloadFonts, theme } from "../themes/elcom";

export default function App({ Component, pageProps }: AppProps) {
  const { query, events: routerEvents } = useRouter();
  const locale = parseLocaleString(query.locale as string);

  useNProgress();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analyticsPageView(url);
    };

    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
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
