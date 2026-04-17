import { useState } from "react";

import { runtimeEnv } from "src/env/runtime";

declare global {
  interface Window {
    _paq?: $IntentionalAny[];
  }
}

export const useMatomo = (): string | undefined => {
  const [matomoId] = useState<string | undefined>(() => runtimeEnv.MATOMO_ID);
  return matomoId;
};

// See https://developer.matomo.org/guides/spa-tracking
export const analyticsPageView = (path: string): void => {
  const { _paq } = window;

  if (!_paq) {
    return;
  }

  _paq.push(["setCustomUrl", path]);
  _paq.push(["setDocumentTitle", document.title]);
  _paq.push(["deleteCustomVariables", "page"]);
  _paq.push(["setGenerationTimeMs", 0]); // TODO: should we track real navigation time?
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
};

// See https://developer.matomo.org/guides/tracking-javascript-guide
export const analyticsSiteSearch = (query: string, results: number): void => {
  const { _paq } = window;

  if (!_paq) {
    return;
  }

  _paq.push(["trackSiteSearch", query, false, results]);
};
