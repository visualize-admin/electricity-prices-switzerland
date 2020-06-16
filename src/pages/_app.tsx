import { I18nProvider } from "@lingui/react";
import { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { GraphqlProvider } from "../graphql/context";
import { catalogs } from "../locales/locales";
import { theme } from "../themes/elcom";

export default function App({ Component, pageProps }: AppProps) {
  const locale = "de";
  return (
    <I18nProvider language={locale} catalogs={catalogs}>
      <GraphqlProvider>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </GraphqlProvider>
    </I18nProvider>
  );
}
