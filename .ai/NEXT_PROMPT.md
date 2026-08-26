# Taktchat — continuidade de sessão

**Branch:** `fix/prod-lentidao`

## Estado
- Commits anteriores: settings/tickets, toast, gzip nginx, docs CDN/HTTP/3.
- Extra: ensure de settings nos hubs de onboard (1º ticket, contato, Encerrar, Facebook, bot, webhook, cron).
- Sem deploy. Depois do merge: GHCR + Portainer; smoke gzip e `GET /tickets`.

## Não fazer
- PM2 na VPS, SQL manual, mover servidor para o Brasil.
