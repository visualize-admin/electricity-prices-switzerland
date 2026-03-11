import fs from "fs";

/**
 * Resolves HTTP basic auth credentials for a given URL from the
 * BASIC_CREDENTIALS_PER_HOST environment variable.
 *
 * BASIC_CREDENTIALS_PER_HOST is expected to be a JSON object mapping
 * hostnames to "user:password" strings, e.g.:
 *   {"strompreis.ref.elcom.admin.ch":"elcom-test:secret"}
 */
export const getBasicCredentials = (
  baseUrl: string
): { username: string; password: string } | undefined => {
  const raw = process.env.BASIC_CREDENTIALS_PER_HOST;
  if (!raw) return undefined;
  try {
    const map: Record<string, string> = JSON.parse(raw);
    const hostname = new URL(baseUrl).hostname;
    const entry = map[hostname];
    if (!entry) return undefined;
    const [username, password] = entry.split(":");
    return { username, password };
  } catch {
    return undefined;
  }
};

type CleanupOptions = {
  /** Keep only requests to /api/graphql */
  graphqlOnly?: boolean;
  /** Extra headers to inject into every request entry */
  extraHeaders?: Record<string, string>;
};

export const cleanupHAR = (path: string, options: CleanupOptions = {}) => {
  const { graphqlOnly = false, extraHeaders = {} } = options;
  const data = JSON.parse(fs.readFileSync(path).toString());

  const cleanRequest = (request: $IntentionalAny) => {
    // The extra "params" confuses k6 (when loading the entry, k6 has an empty {} body).
    // It is not present in HAR from Chrome but it is there in HAR from Playwrights.
    const cleanedRequest = request.postData
      ? (() => {
          const { params: _params, ...keptPostData } = request.postData;
          return { ...request, postData: keptPostData };
        })()
      : request;

    if (Object.keys(extraHeaders).length === 0) {
      return cleanedRequest;
    }

    const overrideNames = new Set(
      Object.keys(extraHeaders).map((n) => n.toLowerCase())
    );
    const filteredHeaders = (cleanedRequest.headers as {
      name: string;
      value: string;
    }[]).filter((h) => !overrideNames.has(h.name.toLowerCase()));
    const injectedHeaders = Object.entries(extraHeaders).map(
      ([name, value]) => ({ name, value })
    );

    return {
      ...cleanedRequest,
      headers: [...filteredHeaders, ...injectedHeaders],
    };
  };

  const isGraphQLEntry = (entry: $IntentionalAny) =>
    entry.request.url.includes("/api/graphql");

  let entries: $IntentionalAny[] = data.log.entries;
  if (graphqlOnly) {
    entries = entries.filter(isGraphQLEntry);
    console.info(
      `Filtered HAR to ${entries.length} GraphQL request(s) (graphqlOnly=true)`
    );
  }

  const transformed = {
    ...data,
    log: {
      ...data.log,
      entries: entries.map((entry: $IntentionalAny) => ({
        ...entry,
        request: cleanRequest(entry.request),
      })),
    },
  };
  fs.writeFileSync(path, JSON.stringify(transformed, null, 2));
};

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });


const envs: { name: string; baseUrl: string }[] = [
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
