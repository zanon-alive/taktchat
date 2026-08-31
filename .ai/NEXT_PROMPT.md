# Taktchat — continuidade de sessão

**Branch git:** `fix/cadastro-empresa-id-sequence`  
**Data:** 2026-08-31

## Feito

Correção do 500 ao cadastrar empresa em produção:

- Sequence `Companies_id_seq` tentava reusar `id=1`
- `AppError` recebia o UniqueConstraintError como status HTTP

MCP Telecontrol desconectado.

## Produção

Após merge: rodar `taktchat_taktchat-migrate` e validar POST `/companies`.

Tentativa imediata (sequence já avançou para o próximo id=2) pode funcionar **antes** do deploy; unique de e-mail/nome ainda viraria 500 até este PR.

## Não fazer

- Push direto na `main`
- Deploy pelo agente
