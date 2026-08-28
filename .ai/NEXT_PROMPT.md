# Taktchat — continuidade de sessão

**Branch git:** `feat/ux-onda-d` (HEAD da cadeia A→B→C→D). Base de merge: PRs empilhados.
**Demanda:** UX pré-produção. Inventário em `.docs/ux-design/levantamento-pre-producao.md`. Comparativo em `.docs/ux-design/comparativo-ondas-abcd.md`.

## Estado

Ondas A–D implementadas e com PR. Percurso comparativo no browser feito (claro/escuro, Beatriz, overlay `/`, modal Desconectar cancelado).

| Onda | Branch | PR |
|------|--------|----|
| A | `feat/ux-onda-a` | https://github.com/zanon-alive/taktchat/pull/43 |
| B | `feat/ux-onda-b` | https://github.com/zanon-alive/taktchat/pull/44 |
| C | `feat/ux-onda-c` | https://github.com/zanon-alive/taktchat/pull/45 |
| D | `feat/ux-onda-d` | https://github.com/zanon-alive/taktchat/pull/46 |

Mergear nesta ordem. Não mergeado em `main` pelo agente.

## Ainda aberto

- P0-11 (lane vs status), Settings agrupado, mix dos cards de Ajuda, drawer só ícone, polimento 1100px (CTAs Conexões / filtros Relatórios).
- Kit da Beatriz **inclui** `tickets.transfer` — o ícone Transferir é esperado.

## Não fazer

- Deploy pelo agente.
- Não commitar `.kiro/`, `.telecontrol/`, rules Cursor soltas, steering 01/02 untracked.
