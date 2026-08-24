# Inventário de fontes existentes

O que já está no repositório e como entra no kit. Nada aqui é copiado no atacado: cada fonte vira insumo, depois a navegação confirma ou corrige.

## Visão geral (usar como base)

| Documento | Reaproveitar para | Cuidado |
|-----------|-------------------|---------|
| `.docs/visao-geral/produto.md` | Comercial (problema, público, objetivos) | Completar com o que a UI realmente entrega |
| `.docs/visao-geral/funcionalidades.md` | Catálogo (índice de módulos) | Linguagem de código; precisa virar jornada |
| `.docs/visao-geral/arquitetura.md` | Apresentação técnica | Manter alto nível nos slides |
| `.docs/visao-geral/whitelabel-architecture.md` | Comercial de revenda + manuais super/parceiro | Conferir menus atuais |
| `.docs/visao-geral/fluxos-criticos.md` | Manuais e demo | Validar na UI |
| `.docs/visao-geral/roadmap.md` | Comercial (visão) e técnico (dívida) | Não vender item de roadmap como entregue |

## Operação e onboarding (usar com filtro)

| Documento | Reaproveitar para | Cuidado |
|-----------|-------------------|---------|
| `.docs/onboarding.md` | Manual admin + onboarding 15 min | Um único público; mistura setup técnico |
| `.docs/docs_admin.md` | Manual admin / super | Não cobre atendente nem parceiro |
| Páginas `/docs` e `/docs_admin` | Checar se o in-app está alinhado ao kit | Pode estar desatualizado |

## Módulos (usar como detalhe, não como estrutura do catálogo)

| Documento | Módulo |
|-----------|--------|
| `.docs/funcionalidades/campanhas.md` | Campanhas |
| `.docs/funcionalidades/tags.md` | Tags / Kanban |
| `.docs/funcionalidades/dashboards.md` | Dashboard e relatórios |
| `.docs/funcionalidades/permissoes.md` | Acesso — **desatualizado** vs. código |
| `.docs/funcionalidades/widget-chat-site.md` | Chat do site / EntrySource |
| `.docs/funcionalidades/whatsapp-api-oficial/` | Dual channel / WABA |
| `.docs/funcionalidades/anti-ban.md` | Governança de disparo (técnico + comercial de risco) |

## Técnico / infra (apresentação técnica, não manual de usuário)

| Documento | Uso no kit |
|-----------|------------|
| `.docs/instalacao/` | Slide “como roda” e go-live |
| `.docs/configuracao/variaveis-ambiente.md` | Técnico; nunca colar secrets |
| `.docs/infraestrutura/` | Stack, Redis, Postgres, produção |
| `.docs/operacao/` | Fora do kit de produto, salvo 1 slide “operar” |

## Legado (só consulta)

`.docs/legacy/` — histórico de permissões, campanhas, deploys. Não citar como documentação vigente sem checar a UI.

## Código (fonte da verdade de rotas e acesso)

| Arquivo | O que extrair |
|---------|----------------|
| `frontend/src/routes/index.js` | Lista de rotas |
| `frontend/src/layout/MainListItems.js` | Menu, condições, rótulos |
| `frontend/src/hooks/usePermissions.js` | Super, admin, permissions[], flags |
| `backend/src/models/User.ts` | Campos de perfil |
| `.docs/visao-geral/whitelabel-architecture.md` | `company.type` e hierarquia |

## O que este inventário **não** substitui

A navegação da Fase 1. Qualquer divergência código × tela × doc antigo deve ser registrada em `11-diario-navegacao.md`.

Ticket (entrada, estados, trabalho no dia a dia): priorizar `10-fluxo-do-ticket.md` em relação a trechos genéricos de `onboarding.md`.
