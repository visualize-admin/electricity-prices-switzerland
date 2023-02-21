import { appWithTranslation } from "next-i18next";
import "core-js/features/array/flat-map";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ThemeProvider } from "theme-ui";
import { analyticsPageView } from "../domain/analytics";
import { GraphqlProvider } from "../graphql/context";
import { useNProgress } from "../lib/use-nprogress";
import { parseLocaleString } from "../locales/locales";
import "../styles/nprogress.css";
import "../styles/reach-dialog.css";
import { preloadFonts, theme } from "../themes/elcom";

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

const ElcomApp = function App({ Component, pageProps }: AppProps) {
  const { query } = useRouter();
  const matomoId = useMatomo();

  useNProgress();

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
      <GraphqlProvider>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </GraphqlProvider>
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
};

export default appWithTranslation(ElcomApp);
