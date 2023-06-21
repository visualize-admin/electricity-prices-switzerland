import { ArgumentParser } from "argparse";
import fs from "fs";
import { spawnSync } from "child_process";

const baseURL = "https://api.k6.io/loadtests/v2";

const createAPI = (token: string) => {
  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const fetchK6Cloud = async (route: string, init: RequestInit) => {
    const resp = await fetch(`${baseURL}${route}`, {
      ...init,
      headers: {
        ...defaultHeaders,
        ...init.headers,
      },
    }).then((t) => t.json());
    if (resp.error) {
      throw new Error(
        `Error while accessing K6 API ${JSON.stringify(resp.error)}`
      );
    }
    return resp;
  };
  return {
    updateTest: async (testId: string, script: string) => {
      try {
        const data = await fetchK6Cloud(`/tests/${testId}`, {
          method: "PATCH",
          body: JSON.stringify({
            script,
          }),
        });
        return data;
      } catch (e) {
        throw new Error(
          `Could not update test: ${e instanceof Error ? e.message : e}`
        );
      }
    },
  };
};

// Will be stringified into the script
const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m30s", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: { http_req_duration: ["avg<200", "p(95)<1000"] },
  ext: {
    loadimpact: {
      distribution: {
        Paris: { loadZone: "amazon:fr:paris", percent: 100 },
      },
    },
  },
};

const main = async () => {
  const parser = new ArgumentParser();
  parser.add_argument("har-file");
  parser.add_argument("k6-cloud-test-id");
  parser.add_argument("--token", {
    default: process.env.K6_CLOUD_TOKEN,
  });

  const args = parser.parse_args();
  if (!args.token) {
    throw new Error(
      "Either pass K6_CLOUD_TOKEN as environment variable or through the --token argument"
    );
  }

  const api = createAPI(args.token);

  const harFile = args["har-file"];
  const testId = args["k6-cloud-test-id"];
  const scriptFilename = "loadtest.js";
  console.log(`Converting HAR ${harFile} to K6 script`);
  const spawned = await spawnSync("./node_modules/.bin/har-to-k6", [
    harFile,
    "-o",
    scriptFilename,
  ]);
  if (spawned.status !== 0) {
    throw new Error(
      `Could not convert har to k6:\n STDOUT: ${spawned.stdout}\n\nSTDERR: ${spawned.stderr}`
    );
  }
  const script = fs
    .readFileSync(scriptFilename)
    .toString()
    .replace(
      "export const options = {}",
      `export const options = ${JSON.stringify(options, null, 2)}`
    );

  console.log(`Updating test ${testId} on K6 cloud...`);
  await api.updateTest(testId, script);
  console.log("Updated test ✅");

  fs.unlinkSync(scriptFilename);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
