#!/bin/bash

set -euo pipefail

sed -i'.bak' 's/^\(#:.*\):.*/\1/' src/locales/**/messages.po
rm src/locales/**/messages*.bak
echo "Removed line numbers from locales"

