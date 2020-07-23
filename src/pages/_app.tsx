import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider } from "theme-ui";
import { I18nProvider } from "../components/i18n-context";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { catalogs, parseLocaleString } from "../locales/locales";
import { preloadFonts, theme } from "../themes/elcom";

export default function App({ Component, pageProps }: AppProps) {
  const { query } = useRouter();
  const locale = parseLocaleString(query.locale as string);

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
