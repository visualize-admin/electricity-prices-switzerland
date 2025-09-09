/**
 * The document reference coming from GEVER must be kept secret so
 * we encrypt it before passing it to the client.
 * We decrypt it when the we receive the download request for a
 * document.
 */

import crypto from "crypto";

const algorithm = "aes-256-ctr";
const secretKey = "ujbHcomPoFP5oU4wRrf6YmHhsVm4issW";

const SEPARATOR = "_";

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${iv.toString("hex")}${SEPARATOR}${encrypted.toString("hex")}`;
};

export const decrypt = (iv_content: string) => {
  const [iv, content] = iv_content.split(SEPARATOR, 2);
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

