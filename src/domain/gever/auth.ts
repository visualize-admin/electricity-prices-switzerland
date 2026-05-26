import crypto from "crypto";
import fs from "fs";

import { ServerError } from "src/server/errors";
import { makeRequest, makeSslConfiguredAgent } from "src/domain/gever/soap";
import * as templates from "src/domain/gever/templates";
import {
  $,
  canonicalizeXML,
  ns,
  parseXMLString,
  serializeXMLToString,
  stripWhitespace,
} from "src/domain/gever/utils";
import serverEnv from "src/env/server";
import assert from "src/lib/assert";

assert(!!serverEnv, "serverEnv is not defined");

export const bindings = {
  ipsts: serverEnv.GEVER_BINDING_IPSTS,
  rpsts: serverEnv.GEVER_BINDING_RPSTS,
  service: serverEnv.GEVER_BINDING_SERVICE,
};

type Awaited<T> = T extends Promise<infer S> ? S : never;

export const prepareIpStsMessage = () => {
  const doc = parseXMLString(templates.req1).documentElement;
  const toNode = $(doc, ns.a, "To");
  toNode.textContent = bindings.ipsts;
  const endpointReference = $(doc, null, "EndpointReference");
  const address = $(endpointReference, null, "Address");
  address.textContent = `http://${new URL(bindings.rpsts).hostname}`;
  return stripWhitespace(serializeXMLToString(doc));
};

export const digestTimestampNode = async (timestampNode: Element) => {
  const timestampCanonical = await canonicalizeXML(timestampNode);
  const hash = crypto.createHash("sha256");
  hash.update(timestampCanonical);
  return hash.digest("base64");
};

export const digestSignedInfoNode = async (
  signedInfoNode: Element,
  binaryToken: Buffer
) => {
  const hmac = crypto.createHmac("sha256", binaryToken);
  const signedInfoCanonical = await canonicalizeXML(signedInfoNode);
  hmac.update(signedInfoCanonical);
  return hmac.digest("base64");
};

export const prepareRpStsDoc = () => {
  const doc = parseXMLString(templates.req2).documentElement;
  const toNode = $(doc, ns.a, "To");
  toNode.textContent = bindings.rpsts;
  const endpointReference = $(doc, null, "EndpointReference");
  const address = $(endpointReference, null, "Address");
  address.textContent = "urn:eiam.admin.ch:pep:GEVER-WS";
  return doc;
};

const memoizeSwr = <T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options: {
    key: (...args: Args) => string;
    timeout: number;
  }
) => {
  const cache = {} as Record<string, { last: T; updatedAt: number }>;
  const { timeout, key: makeKey } = options;
  const revalidate = async (...args: Args) => {
    const cacheKey = makeKey(...args);
    cache[cacheKey] = {
      last: await fn(...args),
      updatedAt: Date.now(),
    };
  };
  return async (...args: Args) => {
    const cacheKey = makeKey(...args);
    const last = cache[cacheKey]?.last;
    const updatedAt = cache[cacheKey]?.updatedAt;
    const shouldRefresh = !updatedAt || Date.now() - updatedAt > timeout;
    if (last) {
      if (shouldRefresh) {
        revalidate(...args);
      }
      return last;
    } else {
      await revalidate(...args);
      return cache[cacheKey]?.last;
    }
  };
};

const requestIpSts = async () => {
  const message = prepareIpStsMessage();
  fs.writeFileSync("/tmp/req1.xml", message);

  let respText: string;
  try {
    respText = await (
      await makeRequest(
        bindings.ipsts,
        message,
        {
          "Content-Type": "text/xml",
          SOAPAction:
            "http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue",
        },
        makeSslConfiguredAgent()
      )
    ).text();
  } catch (e) {
    throw new ServerError("GEVER_AUTH_IPSTS", e);
  }

  const doc = parseXMLString(respText).documentElement;

  const samlAssertion = $(doc, ns.saml2, "Assertion");
  const assertionId = samlAssertion.getAttribute("ID");
  const binaryTokenB64 = $(doc, ns.wst, "BinarySecret", 1)
    .textContent as string;
  const binaryToken = Buffer.from(binaryTokenB64, "base64");

  if (!samlAssertion) {
    throw new Error("Could not find saml assertion in IP-STS response");
  }

  if (!assertionId) {
    throw new Error("Could not find assertion id in IP-STS response");
  }

  return { samlAssertion, assertionId, binaryToken };
};

type IPSTSInfo = Awaited<ReturnType<typeof requestIpSts>>;

const requestRpSts = async (ipStsInfo: IPSTSInfo) => {
  const { samlAssertion, assertionId, binaryToken } = ipStsInfo;
  const doc = prepareRpStsDoc();

  const security = $(doc, ns.o, "Security");
  const timestampNode = $(doc, ns.u, "Timestamp");
  const sigNode = $(doc, ns.sig, "Signature");
  const digestValueNode = $(sigNode, ns.sig, "DigestValue");
  const sigValueNode = $(sigNode, ns.sig, "SignatureValue");
  const keyIdentifier = $(sigNode, ns.o, "KeyIdentifier");

  security.insertBefore(samlAssertion, $(security, ns.sig, "Signature"));

  const creationDate = new Date().toISOString();
  const expirationDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  $(timestampNode, ns.u, "Created").textContent = creationDate;
  $(timestampNode, ns.u, "Expires").textContent = expirationDate;

  const digestValue = await digestTimestampNode(timestampNode);
  digestValueNode.textContent = digestValue;

  const signedInfoNode = $(sigNode, ns.sig, "SignedInfo");
  const signatureValue = await digestSignedInfoNode(
    signedInfoNode,
    binaryToken
  );
  sigValueNode.textContent = signatureValue;

  keyIdentifier.textContent = assertionId;

  let req2 = serializeXMLToString(doc);
  req2 = stripWhitespace(req2);
  fs.writeFileSync("/tmp/req2.xml", req2);

  let respText: string;
  try {
    respText = await (
      await makeRequest(bindings.rpsts, req2, {
        "Content-Type": "application/soap+xml; charset=utf-8",
      })
    ).text();
  } catch (e) {
    throw new ServerError("GEVER_AUTH_RPSTS", e);
  }

  fs.writeFileSync("/tmp/res2.xml", respText);

  const resp2 = parseXMLString(respText).documentElement;
  const samlAssertion2 = $(resp2, ns.saml2, "Assertion");
  if (!samlAssertion2) {
    throw new Error("Could not find SAML assertion in RP-STS response");
  }

  return { samlAssertion: samlAssertion2 };
};

export type RPSTSInfo = Awaited<ReturnType<typeof requestRpSts>>;

export const authenticate = memoizeSwr(
  async () => {
    console.info("IP-STS request...");
    const ipStsInfo = await requestIpSts();
    console.info(`IP-STS OK, assertion: ${ipStsInfo.assertionId}`);
    console.info("RP-STS...");
    const resp2 = await requestRpSts(ipStsInfo);
    console.info(`RP-STS OK: ${resp2.samlAssertion}`);
    return resp2;
  },
  {
    timeout: 10_000,
    key: () => "auth",
  }
);
