import argparse from "argparse";

import {
  encryptSunshineCSVFile,
  getSunshineData,
  sunshineFileIds,
  decryptSunshineCsvFile,
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
      encryptSunshineCSVFile(args.id);
    } catch (error) {
      console.error("❌ Encryption failed:", error);
      process.exit(1);
    }
  } else if (args.command === "decrypt") {
    try {
      console.log("🔓 Starting decryption process...");
      decryptSunshineCsvFile(args.id);
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
