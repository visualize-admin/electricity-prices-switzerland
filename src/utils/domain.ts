export const assertBaseDomainOK = (baseDomain: string) => {
  const url = new URL(baseDomain);

  if (url.hostname.endsWith("elcom.admin.ch") || url.hostname === "localhost") {
    return true;
  }

  throw new Error("Bad baseDomain, baseDomain should end with elcom.admin.ch");
};
