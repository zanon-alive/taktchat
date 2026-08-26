# Taktchat — continuidade de sessão

**Branch:** `fix/landing-nginx-403`

## Estado
- Hotfix: Nginx 403 em `/landing` por causa da pasta `public/landing/` (PNGs).
- Sem deploy até rebuild GHCR da imagem frontend + Portainer.

## Não fazer
- PM2 na VPS, SQL manual, mover servidor para o Brasil.
