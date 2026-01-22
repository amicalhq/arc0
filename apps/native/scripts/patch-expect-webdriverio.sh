#!/bin/bash
# Patch expect-webdriverio package which has a broken lib/index.js path
# The package exports lib/index.js but actually has files in lib/src/

ROOT_DIR="${1:-$(pwd)/../..}"

find "$ROOT_DIR/node_modules/.pnpm" -path "*/expect-webdriverio/lib" -type d 2>/dev/null | while read dir; do
  if [ ! -f "$dir/index.js" ] && [ -f "$dir/src/index.js" ]; then
    echo "Patching expect-webdriverio at $dir"
    echo 'export * from "./src/index.js";' > "$dir/index.js"
  fi
done
