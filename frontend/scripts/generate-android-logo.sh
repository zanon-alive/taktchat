#!/usr/bin/env bash
# Gera frontend/assets/logo.png (1024x1024) a partir do emblema Taktchat.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/frontend/public/android-chrome-192x192.png"
OUT_DIR="$ROOT/frontend/assets"
OUT="$OUT_DIR/logo.png"
mkdir -p "$OUT_DIR"
# Mesmo emblema da PWA, 1024px (zona segura do ícone adaptativo).
ffmpeg -y -i "$SRC" -vf "scale=1024:1024:flags=lanczos" -frames:v 1 "$OUT"
file "$OUT"
