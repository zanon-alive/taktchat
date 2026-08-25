# Taktchat — continuidade de sessão

**Branch:** `docs/kit-documentacao-produto`

## Estado

Kit v1.4 + player privado **prontos**. Smoke local (2026-08-25):

- Sem sessão, `/apresentacoes` vai para `/login`
- `dono@taktchat.local` vê o hub, o menu e o print (blob autenticado)
- PNG sem JWT: 401; atendente da filha: 403
- URL estática no frontend devolve HTML da SPA, não o PNG

Seed SQL só em `.docs/kit-produto/scripts/` — **não** rodar no Postgres da VPS.

Este repositório **não** é projeto Telecontrol e **não** deve ser trackeado no MCP/Cérebro dela.

## Fora desta branch

- Captura real do celular; copy dos slides
- Kanban (`15`), demanda 16, parseInt do signupToken, overlay “API indisponível”
