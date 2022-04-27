import https from "https";
import fetch from "node-fetch";
import fs from "fs";

const getCertificateContent = () => {
  const CERTIFICATE_PATH = process.env.EIAM_CERTIFICATE_PATH;
  const CERTIFICATE_CONTENT = process.env.EIAM_CERTIFICATE_CONTENT;
  const CERTIFICATE_PATH = process.env.EIAM_CERTIFICATE_PATH;
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
  console.log("pfx", pfx);
  console.log("cert", process.env.EIAM_CERTIFICATE_CONTENT);
  const CERTIFICATE_PASSWORD = process.env.EIAM_CERTIFICATE_PASSWORD;

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
  }).then((resp) => {
    if (resp.status === 200) {
      return resp.text();
    } else {
      console.warn(resp);
      throw new Error(`Request failed: ${resp.status} - ${resp.statusText}`);
    }
  });
  return resp;
};

export { makeRequest };
