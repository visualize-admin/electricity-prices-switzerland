declare global {
  interface Window {
    _paq?: $IntentionalAny[];
  }
}

export const analyticsPageView = (path: string) => {
  console.log(window._paq);
  window._paq?.push(["trackPageView"]);
};
