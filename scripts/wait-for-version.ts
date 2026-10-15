#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Polls a deployed app until the version in <html data-app-version> changes,
 * then prints the new version to stdout and exits 0.
 *
 * Basic auth credentials are read from BASIC_CREDENTIALS_PER_HOST
 * (JSON object: { "host": "user:password" }).
 *
 * Usage:
 *   pnpm wait-for-version ref
 *   pnpm wait-for-version abn --interval 30
 *   pnpm wait-for-version prod && notify-phone "prod deployed"
 */

import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
  description: "Wait until the deployed app version changes",
});
const ENVS: Record<string, string> = {
  ref: "https://www.strompreis.ref.elcom.admin.ch/",
  abn: "https://www.strompreis.abn.elcom.admin.ch/",
  prod: "https://www.strompreis.elcom.admin.ch/",
};

parser.add_argument("env", {
  choices: Object.keys(ENVS),
  help: "Environment to watch",
});
parser.add_argument("-i", "--interval", {
  type: "int",
  default: 15,
  help: "Polling interval in seconds (default: 15)",
});
const args = parser.parse_args();
const url = ENVS[args.env];

const getAuthHeader = (url: string): string | undefined => {
  const map: Record<string, string> = JSON.parse(
    process.env.BASIC_CREDENTIALS_PER_HOST ?? "{}"
  );
  const host = new URL(url).hostname;
  const userPass = map[host] ?? map[host.replace(/^www\./, "")];
  return userPass
    ? `Basic ${Buffer.from(userPass).toString("base64")}`
    : undefined;
};

const fetchVersion = async (url: string): Promise<string> => {
  const auth = getAuthHeader(url);
  const res = await fetch(url, {
    headers: auth ? { Authorization: auth } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const match = html.match(/<html[^>]*\sdata-app-version="([^"]*)"/i);
  if (!match) throw new Error("data-app-version not found on <html>");
  return match[1];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const initial = await fetchVersion(url);
  console.error(`Current version: ${initial}, polling every ${args.interval}s`);

  while (true) {
    await sleep(args.interval * 1000);
    try {
      const version = await fetchVersion(url);
      if (version !== initial) {
        console.error(`Version changed: ${initial} → ${version}`);
        console.log(version);
        return;
      }
    } catch (e) {
      console.error(`Fetch failed, retrying: ${(e as Error).message}`);
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
