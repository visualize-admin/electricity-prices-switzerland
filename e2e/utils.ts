import { test } from "@playwright/test";
import fs from "fs";

type $IntentionalAny = any;

const cleanupHAR = (path: string) => {
  const data = JSON.parse(fs.readFileSync(path).toString());

  const cleanRequest = (request: $IntentionalAny) => {
    if (!request.postData) {
      return request;
    } else {
      // The extra "params" confuses k6 (when loading the entry, k6 has an empty {} body).
      // It is not present in HAR from Chrome but it is there in HAR from Playwrights.
      const { params, ...keptPostData } = request.postData;
      return {
        ...request,
        postData: keptPostData,
      };
    }
  };

  const cleanEntry = (entry) => {
    return {
      ...entry,
      request: cleanRequest(entry.request),
    };
  };

  const transformed = {
    ...data,
    log: {
      ...data.log,
      entries: data.log.entries.map(cleanEntry),
    },
  };
  fs.writeFileSync(path, JSON.stringify(transformed, null, 2));
};

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
    console.log(`Saved HAR file from test at ${path}`);

    console.log(`Cleaning up HAR to remove postData ${path}`);
    await cleanupHAR(path);
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
