import crypto from "crypto";
import * as fs from "fs";
import path from "path";

import serverEnv from "src/env/server";

const PASSWORD = serverEnv.PREVIEW_PASSWORD!;

export const decryptSunshineCsv = (): string => {
  try {
    const encryptedData = fs.readFileSync(
      path.join(__dirname, "../sunshine-data.enc")
    );

    const salt = encryptedData.subarray(0, 16);
    const iv = encryptedData.subarray(16, 32);
    const data = encryptedData.subarray(32);

    const key = crypto.pbkdf2Sync(PASSWORD, salt, 100_000, 32, "sha256");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf-8"
    );
  } catch (e) {
    console.error("[Decrypt CSV Error]", e);
    throw new Error(`Failed to decrypt sunshine data: ${e}`);
  }
};
