#!/bin/bash

PO_FILE="./src/locales/en/messages.po"
OUTPUT_FILE="./src/locales/trans-dummy.tsx"

# Empty the output file
> "$OUTPUT_FILE"

# Parse msgid and msgstr and write formatted output
awk '
  BEGIN { msgid=""; msgstr=""; in_msgid=0; in_msgstr=0; skip=0; }

  /^msgid / {
    in_msgid=1; in_msgstr=0;
    msgid=substr($0, 8, length($0)-8);
    next;
  }

  /^msgstr / {
    in_msgstr=1; in_msgid=0;
    msgstr=substr($0, 9, length($0)-9);
    if (msgid != "") {
      # Escape quotes
      gsub(/"/, "\\\"", msgid);
      gsub(/"/, "\\\"", msgstr);
      printf "t({ id: \"%s\", message: \"%s\" })\n", msgid, msgstr;
      msgid=""; msgstr="";
    }
    next;
  }
' "$PO_FILE" > "$OUTPUT_FILE"

echo "✅ Wrote dummy Lingui entries to $OUTPUT_FILE"