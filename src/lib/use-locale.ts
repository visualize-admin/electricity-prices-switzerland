import { createContext, useContext } from "react";
import { defaultLocale, Locales } from "../locales/locales";

const LocaleContext = createContext<Locales>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};
