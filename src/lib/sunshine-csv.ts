import crypto from "crypto";
import fs from "fs";
import path from "path";

import { parse } from "csv-parse/sync";
import { keyBy, memoize } from "lodash";
import { z } from "zod";

import { NetworkLevel } from "src/domain/data";
import serverEnv from "src/env/server";
import { Operator } from "src/graphql/queries";

export const sunshineFileIds = [
  "observations",
  "energy",
  "peer-groups",
  "network-costs",
] as const;
type Id = (typeof sunshineFileIds)[number];

export const encryptSunshineCSVFile = (id: Id) => {
  const PASSWORD = process.env.PREVIEW_PASSWORD!;
  if (!PASSWORD) throw new Error("PREVIEW_PASSWORD not set");

  const INPUT_PATH = path.join(process.cwd(), `./src/sunshine-data/${id}.csv`);
  const OUTPUT_PATH = path.join(process.cwd(), `./src/sunshine-data/${id}.enc`);

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

export const decryptSunshineCsv = (id: Id): string => {
  const PASSWORD = serverEnv.PREVIEW_PASSWORD!;
  try {
    const encryptedData = fs.readFileSync(
      path.join(process.cwd(), `./src/sunshine-data/${id}.enc`)
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

export const decryptSunshineCsvFile = (id: Id) => {
  const decryptedData = decryptSunshineCsv(id);
  const outputPath = path.join(process.cwd(), `./src/sunshine-data/${id}.csv`);
  fs.writeFileSync(outputPath, decryptedData);
  console.log(`✅ Decrypted data saved to: ${outputPath}`);
};

const parseNumber = (val: string): number | null => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const parseGermanBoolean = (val: string): boolean | null => {
  if (val.toLowerCase() === "ja") return true;
  if (val.toLowerCase() === "nein") return false;
  return null;
};

const parseNumberBoolean = (val: string): boolean | null => {
  if (val === "1") return true;
  if (val === "0") return false;
  return null;
};

type RawObservationsRow = Record<string, string>;

const parseObservationRow = (row: RawObservationsRow) => ({
  operatorId: parseInt(row.SunPartnerID, 10),
  operatorUID: row.SunUID,
  name: row.SunName,
  period: row.SunPeriode,
  francRule: parseNumber(row.SunFrankenRegel),
  infoYesNo: parseGermanBoolean(row.SunInfoJaNein),
  infoDaysInAdvance: parseInt(row.SunInfoTageimVoraus),
  networkCostsNE5: parseNumber(row.SunNetzkostenNE5),
  networkCostsNE6: parseNumber(row.SunNetzkostenNE6),
  networkCostsNE7: parseNumber(row.SunNetzkostenNE7),
  productsCount: parseInt(row.SunProdukteAnzahl),
  productsSelection: parseGermanBoolean(row.SunProdukteAuswahl),
  timely: parseNumberBoolean(row.SunRechtzeitig),
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
});

type RawPeerGroupRow = {
  network_operator_id: string;
  settlement_density: string;
  energy_density: string;
};

const parsePeerGroupRow = (row: RawPeerGroupRow) => ({
  operatorId: parseInt(row.network_operator_id, 10),
  settlementDensity: row.settlement_density as string,
  energyDensity: row.energy_density as string,
});

const parseEnergyRow = (_row: RawObservationsRow) => 0 as never;

const NetworkCostRow = z
  .object({
    "Network Operator ID": z.string(),
    SettlementDensity: z.string(),
    EnergyDensity: z.string(),
    Value: z.string().transform(parseFloat),
    NetworkLevel: z.enum(["NL5", "NE7", "NL7", "NE5", "NL6"]),
    Metric: z.enum(["avg", "CHF/Km", "tot?", "CHF/kVA", "Med"]),
  })
  .transform((row) => ({
    // TODO we should have a "period"/year here but it is not yet there in the CSV
    operatorId: parseInt(row["Network Operator ID"], 10),
    peerGroup: {
      settlementDensity: row.SettlementDensity,
      energyDensity: row.EnergyDensity,
    },
    value: row.Value,
    networkLevel: row.NetworkLevel,
    metric: row.Metric,
  }));

const parseNetworkCostsRow = (row: RawObservationsRow) => {
  return NetworkCostRow.parse(row);
};

type ObservationRow = ReturnType<typeof parseObservationRow>;
type PeerGroupRow = ReturnType<typeof parsePeerGroupRow>;
type EnergyRow = ReturnType<typeof parseEnergyRow>; // Assuming energy uses the same parser as observations
type NetworkCostsRow = ReturnType<typeof parseNetworkCostsRow>;

interface ParserMap {
  observations: typeof parseObservationRow;
  "peer-groups": typeof parsePeerGroupRow;
  energy: typeof parseEnergyRow; // Assuming energy uses the same parser as observations
  "network-costs": typeof parseNetworkCostsRow;
}

type ParsedRowType<T extends Id> = T extends "observations"
  ? ObservationRow
  : T extends "peer-groups"
  ? PeerGroupRow
  : T extends "energy"
  ? EnergyRow
  : T extends "network-costs"
  ? NetworkCostsRow
  : never;

const parsers: ParserMap = {
  observations: parseObservationRow,
  "peer-groups": parsePeerGroupRow,
  energy: parseEnergyRow,
  "network-costs": parseNetworkCostsRow,
};

const parseSunshineCsv = <T extends Id>(id: T): ParsedRowType<T>[] => {
  const csv = decryptSunshineCsv(id);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  // Type assertion here is necessary because TypeScript can't infer the connection
  // between the id parameter and the parser that will be selected
  return rows.map(parsers[id]) as ParsedRowType<T>[];
};

type ParsedRow = ReturnType<typeof parseSunshineCsv>[number];

let sunshineDataCache: ParsedRow[] | undefined = undefined;
export const getSunshineData = async <T extends Id>(
  id: T
): Promise<ParsedRowType<T>[]> => {
  if (!sunshineDataCache) {
    sunshineDataCache = await parseSunshineCsv(id);
  }
  return sunshineDataCache! as ParsedRowType<T>[];
};

const getIndexedPeerGroups = memoize(async () => {
  const peerGroups = await getSunshineData("peer-groups");
  const indexed = keyBy(peerGroups, (pg) => pg.operatorId);
  return indexed;
});

export const getPeerGroup = memoize(async (id: Operator["id"]) => {
  if (!id) {
    throw new Error("Operator ID is required to get operator peer group");
  }
  const peerGroupsById = await getIndexedPeerGroups();
  return peerGroupsById[id] || null;
});

/** @knipignore */
export const getNetworkCosts = async (
  operatorId: Operator["id"],
  networkLevel: NetworkLevel["id"]
) => {
  if (!operatorId) {
    throw new Error("Operator ID is required to get operator peer group");
  }
  const networkCosts = await getSunshineData("network-costs");
  return networkCosts.filter(
    (row) =>
      row.operatorId === parseInt(operatorId, 10) &&
      row.networkLevel === networkLevel
  );
};
