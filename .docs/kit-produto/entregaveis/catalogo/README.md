# Catálogo de funcionalidades

Índice do kit. Cada módulo é um arquivo. Situações **simuladas** no banco local (seed). WhatsApp real e parceiro whitelabel completo ficam para rodadas posteriores.

**Ambiente desta versão:** local, 2026-08-21/22. Conexão WhatsApp do Cliente Demo: `DISCONNECTED`. Sem coluna `Companies.type`.

## Módulos

| # | Módulo | Arquivo | Status nesta versão |
|---|--------|---------|---------------------|
| 1 | Atendimento e tickets | [01-atendimento-tickets.md](01-atendimento-tickets.md) | Simulado + UI (prioridade) |
| 2 | Contatos, tags e Kanban | [02-contatos-tags-kanban.md](02-contatos-tags-kanban.md) | Simulado |
| 3 | Conexões WhatsApp | [03-conexoes-whatsapp.md](03-conexoes-whatsapp.md) | UI sem sessão real |
| 4 | Filas e bots | [04-filas-bots.md](04-filas-bots.md) | Simulado |
| 5 | Campanhas | [05-campanhas.md](05-campanhas.md) | Depende do plano |
| 6 | Flow Builder | [06-flow-builder.md](06-flow-builder.md) | UI |
| 7 | IA | [07-ia.md](07-ia.md) | Sem chave nesta máquina |
| 8 | Landing, widget e canais | [08-landing-widget-canais.md](08-landing-widget-canais.md) | UI pública |
| 9 | Chat interno e agendamentos | [09-chat-interno-agendamentos.md](09-chat-interno-agendamentos.md) | Plano |
| 10 | Usuários, permissões e settings | [10-usuarios-permissoes-settings.md](10-usuarios-permissoes-settings.md) | UI |
| 11 | Whitelabel e licenças | [11-whitelabel-licencas.md](11-whitelabel-licencas.md) | Simulado; schema incompleto |
| 12 | Financeiro e dashboards | [12-financeiro-dashboards.md](12-financeiro-dashboards.md) | UI |
| 13 | API e integrações | [13-api-integracoes.md](13-api-integracoes.md) | UI / docs |

## O que o produto não faz

Ver [../../13-o-que-o-produto-nao-faz.md](../../13-o-que-o-produto-nao-faz.md).

## Rodadas futuras

1. Reconstruir jornadas com **WhatsApp real** (QR ou Oficial).
2. Reconstruir jornadas do **parceiro** após migrations (`company.type`).
