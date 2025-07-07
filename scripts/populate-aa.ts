import fs from "fs";
import path from "path";

import * as gettextParser from "gettext-parser";

const file = path.resolve(__dirname, "../src/locales/aa/messages.po");

try {
  const input = fs.readFileSync(file, "utf-8");
  const po = gettextParser.po.parse(input);

  for (const context of Object.values(po.translations)) {
    for (const message of Object.values(context)) {
      if (message.msgid && (!message.msgstr || !message.msgstr[0])) {
        message.msgstr = [message.msgid];
      }
    }
  }

  const output = gettextParser.po.compile(po, { foldLength: 0 });
  fs.writeFileSync(file, output);
  console.log("✔ All empty msgstr filled with msgid");
} catch (error) {
  console.error("❌ Error processing PO file:", error);
  process.exit(1);
}
