import crypto from "crypto";
import fs from "fs";
import path from "path";

import { parse } from "csv-parse/sync";

import serverEnv from "src/env/server";

export const encryptSunshineCSV = () => {
  const PASSWORD = process.env.PREVIEW_PASSWORD!;
  if (!PASSWORD) throw new Error("PREVIEW_PASSWORD not set");

  const INPUT_PATH = path.join(__dirname, "../sunshine-data.csv");
  const OUTPUT_PATH = path.join(__dirname, "../sunshine-data.enc");

  const data = fs.readFileSync(INPUT_PATH);

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);

  const key = crypto.pbkdf2Sync(PASSWORD, salt, 100_000, 32, "sha256");

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  const finalBuffer = Buffer.concat([salt, iv, encrypted]);

  fs.writeFileSync(OUTPUT_PATH, finalBuffer);

  console.log("✅ Encrypted and saved to:", OUTPUT_PATH);
};

export const decryptSunshineCsv = (): string => {
  const PASSWORD = serverEnv.PREVIEW_PASSWORD!;
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

const parseNumber = (val: string): number | null => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

type RawRow = Record<string, string>;

const parseSunshineCsv = () => {
  const csv = decryptSunshineCsv();

  const rows: RawRow[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const data = rows.map((row) => ({
    operatorId: parseInt(row.SunPartnerID, 10),
    operatorUID: row.SunUID,
    name: row.SunName,
    period: row.SunPeriode,
    francRule: parseNumber(row.SunFrankenRegel),
    infoYesNo: row.SunInfoJaNein,
    infoDaysInAdvance: parseInt(row.SunInfoTageimVoraus),
    networkCostsNE5: parseNumber(row.SunNetzkostenNE5),
    networkCostsNE6: parseNumber(row.SunNetzkostenNE6),
    networkCostsNE7: parseNumber(row.SunNetzkostenNE7),
    productsCount: parseInt(row.SunProdukteAnzahl),
    productsSelection: row.SunProdukteAuswahl,
    timely: parseInt(row.SunRechtzeitig),
    saidiTotal: parseNumber(row.SunSAIDItotal),
    saidiUnplanned: parseNumber(row.SunSAIDIungeplant),
    saifiTotal: parseNumber(row.SunSAIFItotal),
    saifiUnplanned: parseNumber(row.SunSAIFIungeplant),
    tariffEC2: parseNumber(row.SunTarifEC2),
    tariffEC3: parseNumber(row.SunTarifEC3),
    tariffEC4: parseNumber(row.SunTarifEC4),
    tariffEC6: parseNumber(row.SunTarifEC6),
    tariffEH2: parseNumber(row.SunTarifEH2),
    tariffEH4: parseNumber(row.SunTarifEH4),
    tariffEH7: parseNumber(row.SunTarifEH7),
    tariffNC2: parseNumber(row.SunTarifNC2),
    tariffNC3: parseNumber(row.SunTarifNC3),
    tariffNC4: parseNumber(row.SunTarifNC4),
    tariffNC6: parseNumber(row.SunTarifNC6),
    tariffNH2: parseNumber(row.SunTarifNH2),
    tariffNH4: parseNumber(row.SunTarifNH4),
    tariffNH7: parseNumber(row.SunTarifNH7),
  }));

  return data;
};

type ParsedRow = ReturnType<typeof parseSunshineCsv>[number];

let sunshineDataCache: ParsedRow[] | undefined = undefined;
export const getSunshineData = async () => {
  if (!sunshineDataCache) {
    sunshineDataCache = await parseSunshineCsv();
  }
  return sunshineDataCache!;
};
