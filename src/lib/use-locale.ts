import { useTranslation } from "react-i18next";
import { defaultLocale, Locale } from "../locales/locales";

export const useLocale = () => {
  const { i18n } = useTranslation();
  return (i18n.language || defaultLocale) as Locale;
};
