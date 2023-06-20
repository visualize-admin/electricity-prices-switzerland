import { test } from "@playwright/test";

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
export const testAndSaveHar = async (
  name: string,
  path: string,
  run: ({ page: Page, browser: Browser }) => Promise<void>
) => {
  test(name, async ({ page: defaultPage, browser }) => {
    test.slow();
    await defaultPage.close();
    const context = await browser.newContext({
      recordHar: { path },
    });
    const page = await context.newPage();

    await run({ browser, page });

    await context.close();
  });
};

export const envs: { name: string; baseUrl: string }[] = [
  { name: "ref", baseUrl: "https://strompreis.ref.elcom.admin.ch" },
  { name: "abn", baseUrl: "https://strompreis.abn.elcom.admin.ch" },
  { name: "prod", baseUrl: "https://strompreis.elcom.admin.ch" },
  {
    name: "local",
    baseUrl: "localhost",
  },
];

export const getEnv = (name: string) => {
  const found = envs.find((x) => x.name === name);
  if (!found) {
    throw new Error(`Could not find environment ${name}`);
  }
  return found;
};
