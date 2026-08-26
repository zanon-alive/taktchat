# Taktchat — continuidade de sessão

**Branch:** `fix/prod-lentidao`

## Estado
- Quatro commits: settings/tickets, toast, gzip nginx, docs CDN/HTTP/3.
- Sem deploy. Depois do merge: GHCR + Portainer; smoke gzip e `GET /tickets`.

## Não fazer
- PM2 na VPS, SQL manual, mover servidor para o Brasil.
