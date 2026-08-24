# Kit de documentação por audiência

Fonte da verdade desta demanda. Se algo divergir da pasta gitignored `.docs/branchs/docs/kit-documentacao-produto/`, **vale este kit**.

**Branch:** `docs/kit-documentacao-produto`  
**Status:** v1.4 — lote fechado. Player em `/apresentacoes` (6 decks). WhatsApp Cliente Demo Kit **CONNECTED**. Roadmap: [14-roadmap-execucao.md](14-roadmap-execucao.md).

## Decisões travadas

| Tema | Decisão |
|------|---------|
| Logins | Criados no banco **local**; lista em `09-logins-locais.md` |
| Apresentações | Versão **padrão e longa**, para comercial e técnica |
| Comercial | **Dois decks**: cliente final e parceiro |
| Screenshots | Sim, nesta versão |
| README da raiz | Pode estar incompleto; revisar na Fase 6 |
| Ticket | Funcionalidade central; ver `10-fluxo-do-ticket.md` |
| Código de produto | Não alterar **exceto** a rota pública `/apresentacoes` (hub + 6 decks), autorizada nesta branch |

## Como usar

1. `00-plano-construcao.md` — fases (não pular a 1).
2. `09-logins-locais.md` — com quem entrar.
3. `03-checklist-navegacao.md` + `08-ficha-tela.template.md` + `11-diario-navegacao.md` — durante a navegação.
4. `12-glossario.md` — atualizar na Fase 1, não deixar para o fim.
5. Entregáveis finais só em `entregaveis/`, a partir da Fase 3, com a estrutura de `05-estrutura-entregaveis.md`.

## Guias

| Arquivo | Função |
|---------|--------|
| [00-plano-construcao.md](00-plano-construcao.md) | Fases 0–6 |
| [01-inventario-fontes.md](01-inventario-fontes.md) | Docs antigos reaproveitáveis |
| [02-mapa-roles.md](02-mapa-roles.md) | Personas vs. código |
| [03-checklist-navegacao.md](03-checklist-navegacao.md) | Rotas e jornadas (coluna Status) |
| [04-matriz-permissoes.template.md](04-matriz-permissoes.template.md) | Template da matriz |
| [05-estrutura-entregaveis.md](05-estrutura-entregaveis.md) | Outline dos arquivos finais |
| [06-publico-e-tom.md](06-publico-e-tom.md) | Audiência e linguagem |
| [07-lacunas-e-perguntas.md](07-lacunas-e-perguntas.md) | Pendências e schema local |
| [08-ficha-tela.template.md](08-ficha-tela.template.md) | Uma ficha por tela visitada |
| [09-logins-locais.md](09-logins-locais.md) | Usuários de teste |
| [10-fluxo-do-ticket.md](10-fluxo-do-ticket.md) | Abertura e trabalho do ticket (validar na UI) |
| [11-diario-navegacao.md](11-diario-navegacao.md) | Notas, bugs, divergências |
| [12-glossario.md](12-glossario.md) | Termos — começar na Fase 1 |
| [13-o-que-o-produto-nao-faz.md](13-o-que-o-produto-nao-faz.md) | Limites e honestidade comercial |
| [14-roadmap-execucao.md](14-roadmap-execucao.md) | O que esta branch entregou |
| [15-pendencias-produto-outras-branches.md](15-pendencias-produto-outras-branches.md) | Kanban/ticket para outras branches |
| [16-demanda-crm-conversa-ou-mercado.md](16-demanda-crm-conversa-ou-mercado.md) | Demanda (draft): CRM de conversa vs. CRM de mercado |

## Entregáveis finais (v1)

Ver [`entregaveis/README.md`](entregaveis/README.md).

- [Catálogo](entregaveis/catalogo/README.md)
- [Manuais](entregaveis/manuais/)
- [Apresentações](entregaveis/apresentacoes/)
- [Extras](entregaveis/extras/)
- [Roadmap da execução](14-roadmap-execucao.md)
