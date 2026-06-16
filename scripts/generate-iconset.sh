#!/bin/bash
# Generate macOS iconset from icon.png
# Requires: sips (macOS built-in)

set -e

SRC="src/assets/icon.png"
OUT="src/assets/icon.iconset"

if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found"
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

SIZES=(16 32 64 128 256 512)

for size in "${SIZES[@]}"; do
  sips -z $size $size "$SRC" --out "$OUT/icon_${size}x${size}.png" >/dev/null
  double=$((size * 2))
  sips -z $double $double "$SRC" --out "$OUT/icon_${size}x${size}@2x.png" >/dev/null
done

echo "Iconset created at $OUT"
echo "Contents:"
ls -la "$OUT"
