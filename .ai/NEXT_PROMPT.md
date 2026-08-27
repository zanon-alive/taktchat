# Taktchat — continuidade de sessão

**Branch git:** `main`
**Demanda:** landing / tour / FAB WhatsApp — **encerrada** (2026-08-27)
**PRs:** https://github.com/zanon-alive/taktchat/pull/40 e https://github.com/zanon-alive/taktchat/pull/41 (mergeados, em produção)

## Estado
- Menu da `/landing` visível; tour volta para a landing; CTA WhatsApp sem formulário; FAB fixo empilhado com cookies (e com o chat do site, se injetado).
- Validado em `https://taktchat.com.br` (landing, tour, tablet, cookies). Chat do site não estava injetado nas settings. Sessão Admin no browser impediu reteste frio do `/login`.

## Não fazer
- Deploy pelo agente.
- Reabrir esta demanda sem pedido novo.

## MCP
- Telecontrol desconectado nesta sessão; `analyze_demand` / `log_activity` / `log_deploy` na sync queue local (`.telecontrol/sync-queue.json`).
