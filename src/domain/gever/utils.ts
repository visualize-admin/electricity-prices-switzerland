import { JSDOM } from "jsdom";
import c14nFactory from "xml-c14n";

export const ns = {
  a: "http://www.w3.org/2005/08/addressing",
  u: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
  saml2: "urn:oasis:names:tc:SAML:2.0:assertion",
  o: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
  wst: "http://docs.oasis-open.org/ws-sx/ws-trust/200512",
  sig: "http://www.w3.org/2000/09/xmldsig#",
  client: "http://Adnovum.FatClient.Soap",
};

export const $ = (
  doc: Element,
  ns: string | null,
  qs: string,
  index?: number
) => {
  const elements = ns
    ? doc.getElementsByTagNameNS(ns, qs)
    : doc.getElementsByTagName(qs);
  if (elements.length > 1 && typeof index === "undefined") {
    console.warn(elements);
    throw new Error(`Too many elements for ${ns}:${qs}, please add an index`);
  }
  if (!elements.length) {
    throw new Error(`Could not find ${ns}:${qs}, index: ${index}`);
  }
  const res = elements[typeof index === "undefined" ? 0 : index];
  return res;
};

export const $$ = (doc: Element, ns: string | null, qs: string) => {
  const elements = ns
    ? doc.getElementsByTagNameNS(ns, qs)
    : doc.getElementsByTagName(qs);
  if (!elements.length) {
    throw new Error(`Could not find ${ns ? `${ns}:${qs}` : qs}`);
  }
  return Array.from(elements);
};

export const canonicalizeXML = async (tree: Element): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canonicaliser = c14n.createCanonicaliser(
      "http://www.w3.org/2001/10/xml-exc-c14n#"
    );
    canonicaliser.canonicalise(tree, function (err, res) {
      if (err) {
        return reject(err);
      }

      // Remove all white space
      res = res.replace(/\n/gi, "");
      res = res.replace(/\s+</gi, "<");

      resolve(res as string);
    });
  });
};

const c14n = c14nFactory();

export const serializeXMLToString = (tree: Element) => {
  const dom = new JSDOM();
  return new dom.window.XMLSerializer().serializeToString(tree);
};

export const parseXMLString = (xmlStr: string) => {
  const dom = new JSDOM();
  return new dom.window.DOMParser().parseFromString(xmlStr, "text/xml");
};

export const stripWhitespace = (xmlStr: string) => {
  return xmlStr.replace(/>\s+</gm, "><");
};
