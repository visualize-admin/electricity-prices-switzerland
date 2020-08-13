import { I18n } from "@lingui/core";
import {
  I18n as LinguiI18n,
  I18nProvider as LinguiI18nProvider,
} from "@lingui/react";
import { I18nProviderProps } from "@lingui/react/I18nProvider";
import { createContext, useContext } from "react";

const I18nContext = createContext<I18n | undefined>(undefined);

export const I18nProvider = ({ children, ...props }: I18nProviderProps) => {
  return (
    <LinguiI18nProvider {...props}>
      <LinguiI18n>
        {({ i18n }) => {
          return (
            <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>
          );
        }}
      </LinguiI18n>
    </LinguiI18nProvider>
  );
};

export const useI18n = (): I18n => {
  const i18n = useContext(I18nContext);

  if (!i18n) {
    throw Error(
      "No I18nProvider found. Please make sure that `useI18n` is wrapped in a I18nProvider"
    );
  }

  return i18n;
};
