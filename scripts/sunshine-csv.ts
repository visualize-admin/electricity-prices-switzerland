import fs from "fs";

import argparse from "argparse";

import {
  encryptSunshineCSV,
  decryptSunshineCsv,
  getSunshineData,
  sunshineFileIds,
} from "../src/lib/sunshine-csv";

const mutable = (arr: readonly string[]) => {
  return arr as string[];
};

const main = async () => {
  const parser = new argparse.ArgumentParser({
    description: "CLI to encrypt and decrypt sunshine CSV data",
    prog: "sunshine-csv",
  });

  // Create subparsers for commands
  const subparsers = parser.add_subparsers({
    title: "commands",
    dest: "command",
  });

  // Encrypt command
  const encrypt = subparsers.add_parser("encrypt", {
    help: "Encrypt the sunshine CSV data",
  });

  encrypt.add_argument("-i", "--id", {
    help: "ID of the sunshine CSV data to encrypt",
    required: true,
    choices: mutable(sunshineFileIds),
  });

  // Decrypt command
  const decrypt = subparsers.add_parser("decrypt", {
    help: "Decrypt the sunshine CSV data",
  });
  decrypt.add_argument("-o", "--output", {
    help: "Output path for decrypted data",
    required: false,
  });
  decrypt.add_argument("-i", "--id", {
    help: "ID of the sunshine CSV data to decrypt",
    required: true,
    choices: mutable(sunshineFileIds),
  });

  const json = subparsers.add_parser("json", {
    help: "Outputs the sunshine CSV data as the JSON used in the app",
  });

  json.add_argument("-i", "--id", {
    help: "ID of the sunshine CSV data to convert to JSON",
    required: true,
    choices: mutable(sunshineFileIds),
  });

  // Parse arguments
  const args = parser.parse_args();

  // Handle commands
  if (args.command === "encrypt") {
    try {
      console.log("🔒 Starting encryption process...");
      encryptSunshineCSV(args.id);
    } catch (error) {
      console.error("❌ Encryption failed:", error);
      process.exit(1);
    }
  } else if (args.command === "decrypt") {
    try {
      console.log("🔓 Starting decryption process...");
      const decryptedData = decryptSunshineCsv(args.id);

      if (args.output) {
        fs.writeFileSync(args.output, decryptedData);
        console.log(`✅ Decrypted data saved to: ${args.output}`);
      } else {
        console.log(decryptedData);
      }
    } catch (error) {
      console.error("❌ Decryption failed:", error);
      process.exit(1);
    }
  } else if (args.command === "json") {
    const decryptedData = await getSunshineData(args.id);
    console.log(JSON.stringify(decryptedData, null, 2));
  } else {
    parser.print_help();
  }
};

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
