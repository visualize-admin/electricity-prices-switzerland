import { I18n } from "@lingui/core";
import {
  I18n as LinguiI18n,
  I18nProvider as LinguiI18nProvider,
} from "@lingui/react";
import { I18nProviderProps } from "@lingui/react/I18nProvider";
import { createContext, useContext } from "react";
import { useLocale } from "../lib/use-locale";

const I18nContext = createContext<I18n | undefined>(undefined);
const I18nHashContext = createContext<string | undefined>(undefined);

export const I18nProvider = ({ children, ...props }: I18nProviderProps) => {
  return (
    <LinguiI18nProvider {...props}>
      <LinguiI18n>
        {({ i18n, i18nHash }) => {
          return (
            <I18nHashContext.Provider value={i18nHash}>
              <I18nContext.Provider value={i18n}>
                {children}
              </I18nContext.Provider>
            </I18nHashContext.Provider>
          );
        }}
      </LinguiI18n>
    </LinguiI18nProvider>
  );
};

export const useI18n = (): I18n => {
  useContext(I18nHashContext); // Force update when hash changes
  const i18n = useContext(I18nContext);

  if (!i18n) {
    throw Error(
      "No I18nProvider found. Please make sure that `useI18n` is wrapped in a I18nProvider"
    );
  }

  return i18n;
};
