#!/usr/bin/env bash
# Resolve o número do PR associado ao commit do build (push na main após merge).
# Escreve pr=<numero> (vazio se não houver) em $GITHUB_OUTPUT.
set -euo pipefail

SHA="${GITHUB_SHA:-}"
REPO="${GITHUB_REPOSITORY:-}"
OUT="${GITHUB_OUTPUT:-/dev/stdout}"
PR=""

if [ -z "$SHA" ] || [ -z "$REPO" ]; then
  echo "pr=" >> "$OUT"
  echo "SHA/REPO ausentes; PR não resolvido."
  exit 0
fi

if command -v gh >/dev/null 2>&1 && [ -n "${GH_TOKEN:-${GITHUB_TOKEN:-}}" ]; then
  JSON="$(gh api "repos/${REPO}/commits/${SHA}/pulls" \
    -H "Accept: application/vnd.github+json" 2>/dev/null || echo "[]")"
  PR="$(printf '%s' "$JSON" | jq -r '(map(select(.merged_at != null)) | .[0].number) // .[0].number // empty' 2>/dev/null || true)"
fi

if [ -z "$PR" ] || [ "$PR" = "null" ]; then
  MSG="$(git log -1 --pretty=%s 2>/dev/null || true)"
  if [ -z "$MSG" ] && [ -n "${COMMIT_MESSAGE:-}" ]; then
    MSG="$COMMIT_MESSAGE"
  fi
  PR="$(printf '%s' "$MSG" | grep -oE '(Merge pull request #|#)[0-9]+' | grep -oE '[0-9]+' | head -1 || true)"
fi

if [ "$PR" = "null" ]; then
  PR=""
fi

echo "pr=${PR}" >> "$OUT"
echo "Resolved PR: ${PR:-none} SHA: ${SHA}"
