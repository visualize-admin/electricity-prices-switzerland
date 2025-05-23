import fs from "fs";

import argparse from "argparse";

import {
  encryptSunshineCSV,
  decryptSunshineCsv,
  getSunshineData,
} from "../src/lib/sunshine-csv";

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
  subparsers.add_parser("encrypt", {
    help: "Encrypt the sunshine CSV data",
  });

  // Decrypt command
  const decryptParser = subparsers.add_parser("decrypt", {
    help: "Decrypt the sunshine CSV data",
  });
  decryptParser.add_argument("-o", "--output", {
    help: "Output path for decrypted data",
    required: false,
  });

  subparsers.add_parser("json", {
    help: "Outputs the sunshine CSV data as the JSON used in the app",
  });

  // Parse arguments
  const args = parser.parse_args();

  // Handle commands
  if (args.command === "encrypt") {
    try {
      console.log("🔒 Starting encryption process...");
      encryptSunshineCSV();
    } catch (error) {
      console.error("❌ Encryption failed:", error);
      process.exit(1);
    }
  } else if (args.command === "decrypt") {
    try {
      console.log("🔓 Starting decryption process...");
      const decryptedData = decryptSunshineCsv();

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
    const decryptedData = await getSunshineData();
    console.log(JSON.stringify(decryptedData, null, 2));
  } else {
    parser.print_help();
  }
};

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
