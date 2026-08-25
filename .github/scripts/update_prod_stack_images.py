#!/usr/bin/env python3
"""Atualiza pinagens @sha256: no YAML da stack Taktchat (repo de stacks)."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


HEX64 = r"[a-f0-9]{64}"


def normalize_hex(digest: str) -> str:
    value = digest.strip()
    if value.startswith("sha256:"):
        value = value[len("sha256:") :]
    if not re.fullmatch(HEX64, value):
        raise ValueError(f"digest inválido: {digest!r}")
    return value


def apply_digests(
    text: str,
    *,
    backend: str | None = None,
    browser: str | None = None,
    frontend: str | None = None,
) -> str:
    updated = text
    # browser antes de backend: o nome backend é prefixo de backend-browser
    if browser:
        hex_digest = normalize_hex(browser)
        updated, n = re.subn(
            rf"(taktchat-backend-browser@sha256:){HEX64}",
            rf"\g<1>{hex_digest}",
            updated,
        )
        if n == 0:
            raise ValueError("nenhuma linha taktchat-backend-browser@sha256 encontrada")
    if backend:
        hex_digest = normalize_hex(backend)
        updated, n = re.subn(
            rf"(taktchat-backend@sha256:){HEX64}",
            rf"\g<1>{hex_digest}",
            updated,
        )
        if n == 0:
            raise ValueError("nenhuma linha taktchat-backend@sha256 encontrada")
    if frontend:
        hex_digest = normalize_hex(frontend)
        updated, n = re.subn(
            rf"(taktchat-frontend@sha256:){HEX64}",
            rf"\g<1>{hex_digest}",
            updated,
        )
        if n == 0:
            raise ValueError("nenhuma linha taktchat-frontend@sha256 encontrada")
    return updated


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    parser.add_argument("--backend-digest")
    parser.add_argument("--browser-digest")
    parser.add_argument("--frontend-digest")
    args = parser.parse_args()

    if not any([args.backend_digest, args.browser_digest, args.frontend_digest]):
        print("nenhum digest informado; nada a fazer", file=sys.stderr)
        return 0

    original = args.file.read_text(encoding="utf-8")
    updated = apply_digests(
        original,
        backend=args.backend_digest,
        browser=args.browser_digest,
        frontend=args.frontend_digest,
    )
    if updated == original:
        print("digests já estavam atualizados")
        return 0
    args.file.write_text(updated, encoding="utf-8")
    print("arquivo atualizado")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
