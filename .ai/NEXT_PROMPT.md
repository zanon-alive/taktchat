# Taktchat — continuidade de sessão

**Branch git:** `feat/landing-fab-melhorias`
**Demanda anterior:** landing / tour / FAB — encerrada (#40, #41)
**Demanda atual:** 5 melhorias pós-produção (em implementação)

## Estado
- Número da vitrine via setting `supportWhatsAppNumber`.
- Migration liga `enableSiteChatWidget` na empresa 1.
- `widget.js` com `data-api-url` e `prefers-reduced-motion`.
- Teste frio do FAB com diálogo de API no mount.

## Não fazer
- Deploy pelo agente.
- Não commitar `.kiro/`, `.telecontrol/`, rules Cursor soltas.

## MCP
- Telecontrol desconectado; sync queue local.
