import { createContext, useContext } from "react";

import { defaultLocale } from "src/locales/config";
import { Locale } from "src/locales/locales";

const LocaleContext = createContext<Locale>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};
