export const assertBaseDomainOK = (baseDomain: string) => {
  const url = new URL(baseDomain);

  if (
    url.hostname.endsWith("elcom.admin.ch") ||
    url.hostname === "localhost" ||
    url.hostname.match(/^elcom\.admin\.ch$/i) ||
    url.hostname.match(/^elcom-strompreis-dev\.interactivethings\.io/i) ||
    url.hostname.match(
      /^elcom-electricity-price-website-[a-z0-9-]+\.vercel\.app$/i
    )
  ) {
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    // Can be the case when testing via ngrok
    return;
  }

  throw new Error("Bad baseDomain, baseDomain should end with elcom.admin.ch");
};
