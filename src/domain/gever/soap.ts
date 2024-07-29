import fs from "fs";
import https from "https";

import fetch from "node-fetch";

import serverEnv from "src/env/server";

const getCertificateContent = () => {
  if (!serverEnv) {
    throw new Error("serverEnv must be defined");
  }
  const CERTIFICATE_PATH = serverEnv?.EIAM_CERTIFICATE_PATH;
  const CERTIFICATE_CONTENT = serverEnv?.EIAM_CERTIFICATE_CONTENT;
  if (CERTIFICATE_PATH) {
    if (!fs.existsSync(CERTIFICATE_PATH)) {
      throw new Error(`Certificate file does not exist ${CERTIFICATE_PATH}`);
    }
    return fs.readFileSync(CERTIFICATE_PATH);
  } else if (CERTIFICATE_CONTENT) {
    return Buffer.from(CERTIFICATE_CONTENT, "base64");
  } else {
    throw new Error(
      "You must either provide EIAM_CERTIFICATE_PATH or EIAM_CERTIFICATE_CONTENT (base64) to perform secure queries"
    );
  }
};

export const makeSslConfiguredAgent = () => {
  const pfx = getCertificateContent();
  const CERTIFICATE_PASSWORD = serverEnv?.EIAM_CERTIFICATE_PASSWORD;

  if (!CERTIFICATE_PASSWORD) {
    throw new Error("EIAM_CERTIFICATE_PASSWORD must be defined in env");
  }
  return new https.Agent({
    pfx,
    passphrase: CERTIFICATE_PASSWORD,
  });
};

const makeRequest = async (
  url: string,
  body: string,
  headers: Record<string, string>,
  agent?: https.Agent
) => {
  const resp = await fetch(url, {
    method: "POST",
    body: body,
    headers: headers,
    agent: agent,
    follow: 0,
  }).then(async (resp) => {
    if (resp.status === 200) {
      return resp;
    } else {
      console.warn(resp);
      console.warn(await resp.text());
      throw new Error(
        `GEVER SOAP Error, request failed (${url}): ${resp.status} - ${resp.statusText}`
      );
    }
  });
  return resp;
};

export { makeRequest };
