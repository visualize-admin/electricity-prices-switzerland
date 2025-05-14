import crypto from "crypto";
import fs from "fs";
import path from "path";

const PASSWORD = process.env.PREVIEW_PASSWORD!;
if (!PASSWORD) throw new Error("PREVIEW_PASSWORD not set");

const INPUT_PATH = path.join(process.cwd(), "src/sunshine-data.csv");
const OUTPUT_PATH = path.join(process.cwd(), "src/sunshine-data.enc");

const data = fs.readFileSync(INPUT_PATH);

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(16);

const key = crypto.pbkdf2Sync(PASSWORD, salt, 100_000, 32, "sha256");

const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

const finalBuffer = Buffer.concat([salt, iv, encrypted]);

fs.writeFileSync(OUTPUT_PATH, finalBuffer);

console.log("✅ Encrypted and saved to:", OUTPUT_PATH);
