import https from "https";
import fetch from "node-fetch";
import fs from 'fs'

export const makeSslConfiguredAgent = () => {
  const CERTIFICATE_PATH = process.env.EIAM_CERTIFICATE_PATH;
  const CERTIFICATE_PASSWORD = process.env.EIAM_CERTIFICATE_PASSWORD;
  
  if (!CERTIFICATE_PATH || !CERTIFICATE_PASSWORD) {
    throw new Error(
      "EIAM_CERTIFICATE_PATH and EIAM_CERTIFICATE_PASSWORD must be defined in env"
    );
  }
  const pfx = fs.readFileSync(CERTIFICATE_PATH)

  return new https.Agent({
      pfx,
      passphrase: CERTIFICATE_PASSWORD,
    });
}


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
      return resp.text()
    } else {
      console.warn(resp)
      throw new Error(`Request failed: ${resp.status} - ${resp.statusText}`)
    }
  });
  return resp;
};

export { makeRequest };
