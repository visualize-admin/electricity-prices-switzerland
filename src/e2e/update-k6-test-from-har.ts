import { spawnSync } from "child_process";
import fs from "fs";

import { ArgumentParser } from "argparse";

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
  thresholds: { http_req_duration: ["avg<500", "p(95)<1000"] },
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
  parser.add_argument("harFile");
  parser.add_argument("testId");
  parser.add_argument("--script-filename", {
    dest: "scriptFilename",
    default: "loadtest.js",
    help: "Alternative name for script file, can be used in conjunction with --no-update",
  });
  parser.add_argument("--no-update", {
    action: "store_false",
    dest: "update",
    default: true,
    help: "The K6 Cloud script will not be updated, can be used in conjunction with --keep-script-file",
  });
  parser.add_argument("--keep-script-file", {
    action: "store_true",
    dest: "keepScriptFile",
    default: false,
    help: 'The generated script file will not be deleted, useful to run script with "k6 run" locally',
  });
  parser.add_argument("--token", {
    default: process.env.K6_CLOUD_TOKEN,
  });

  const args = parser.parse_args();
  const { harFile, testId, keepScriptFile, update, token, scriptFilename } =
    args;
  if (!args.token && update) {
    throw new Error(
      "Either pass K6_CLOUD_TOKEN as environment variable or through the --token argument"
    );
  }

  const api = createAPI(token);
  const spawned = await spawnSync("./node_modules/.bin/har-to-k6", [
    harFile,
    "-o",
    scriptFilename,
    "--add-sleep",
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
  fs.writeFileSync(scriptFilename, script);
  console.info(`Converted HAR ${harFile} to K6 script ${scriptFilename} ✅`);

  if (update !== false) {
    console.info(`Updating test ${testId} on K6 cloud...`);
    await api.updateTest(testId, script);
    console.info("Updated test ✅");
  }

  if (keepScriptFile !== true) {
    console.info(`Removing script file ${scriptFilename}`);
    fs.unlinkSync(scriptFilename);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
