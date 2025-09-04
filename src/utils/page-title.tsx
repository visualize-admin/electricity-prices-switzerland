import { t } from "@lingui/macro";

export const makePageTitle = (pageTitle?: string) => {
  return `${pageTitle ? `${pageTitle} - ` : ""}${t({
    id: "site.title",
    message: "Electricity tariffs in Switzerland",
  })}`;
};
