const redactedNodes = [
  "s:SignatureValue",
  "ds:X509Certificate",
  "ds:SignatureValue",
  "ds:DigestValue",
  "saml2:Issuer",
  "o:Security",
];

export const redactSAML = (original: string) => {
  let redacted = original;
  for (const redactedNode of redactedNodes) {
    const rx = new RegExp(
      `(<${redactedNode}.*?>)[\\s\\S]*(</${redactedNode}>)`,
      "gim"
    );
    redacted = redacted.replace(rx, `$1REDACTED$2`);
  }
  return redacted;
};
