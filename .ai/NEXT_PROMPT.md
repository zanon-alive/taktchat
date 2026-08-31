# Taktchat — continuidade de sessão

**Branch git:** `fix/frontend-spa-index-nginx`  
**Data:** 2026-08-31

## Feito

Commit local: `fix(frontend): impede SPA vazia no GHCR por import duplicado`

- Import duplicado `TransferTicketModalCustom` removido
- Guarda no `frontend/Dockerfile` após `npm run build`
- Testes estáticos: PASS

PR ainda não criado. MCP Telecontrol desconectado.

## Produção (ainda quebrada até aplicar)

Rollback Portainer para frontend PR #48:

`ghcr.io/zanon-alive/taktchat-frontend@sha256:ecb677270cebaf0323d2f369384715d353aa08f02c8a3276f6bb88e13a37cec3`

Ou merge desta branch + Action + GitOps.

## Não fazer

- Deploy/SSH pelo agente
- Push direto na `main`
