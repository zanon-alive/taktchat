# Mapa funcional do frontend

Referência da revisão documental v1.8, baseada em `frontend/src/routes/index.js`, `frontend/src/layout/MainListItems.js` e nos gates de permissão/plano. Ter uma página em `frontend/src/pages` não significa que ela possua rota ou menu.

## Rotas públicas

| Rota | Finalidade |
|---|---|
| `/landing` | Página comercial e entrada de leads |
| `/login` | Autenticação |
| `/signup` | Cadastro público |
| `/signup-partner` | Cadastro vinculado a parceiro |
| `/docs` | Documentação de onboarding |
| `/docs_admin` | Documentação administrativa |

`/forgot-password` e `/reset-password` também são públicas. As rotas de documentação passam pelo provider de autenticação, mas não exigem `isPrivate`.

## Rotas privadas por área

| Área | Rotas principais | Menu e gates |
|---|---|---|
| Gestão | `/`, `/moments` | `admin`/`super` ou flags legadas de dashboard/tempo real |
| Atendimento | `/tickets/:ticketId?`, `/quick-messages` | Permissões `tickets.view` e `quick-messages.view` |
| Kanban | `/kanban`, `/Kanban`, `/kanban/stats` | Plano `useKanban` + `kanban.view` |
| Contatos | `/contacts`, `/contacts/import`, `/tags` | Permissões de contatos/tags; importação não tem item próprio no menu |
| Agenda e chat | `/schedules`, `/chats/:id?` | `useSchedules`/`useInternalChat` + permissão |
| Campanhas | `/campaigns`, `/contact-lists`, `/contact-lists/:id/contacts`, `/campaigns-config`, `/campaign/:id/detailed-report` | `cshow`, `useCampaigns` e `campaigns.view` |
| Fluxos | `/flowbuilders`, `/flowbuilder/:id?`, `/phrase-lists` | `flowbuilder.view` |
| Administração | `/users`, `/queues`, `/connections`, `/files`, `/settings` | Permissões específicas; conexões também usam flags legadas |
| IA e integrações | `/prompts`, `/ai-settings`, `/queue-integration`, `/messages-api` | Gates de plano e permissões |
| Plataforma/parceiro | `/companies`, `/licenses`, `/partner-billing-report`, `/allConnections`, `/announcements` | `super` e/ou empresa `whitelabel`, conforme o recurso |
| Financeiro | `/financeiro` | `financeiro.view` |
| Ajuda | `/helps` e subrotas | `helps.view` no menu |
| Apresentações | `/apresentacoes`, `/apresentacoes/:deckId` | Somente empresa `platform`; `super`, admin da plataforma ou `apresentacoes.view` |

## Rotas existentes sem item de menu

- `/reports`
- `/todolist` (item de menu comentado)
- `/TagsKanban`
- `/contacts/import`

A tela Tags Kanban está registrada como **`/TagsKanban`**. O path `/tagsKanban` não existe e deve ser tratado como referência documental incorreta.

## Páginas existentes sem rota

- `AuditLogs`
- `SmartFilesDashboard`
- `FlowDefault`
- `CampaignReport`
- `Subscription`

Essas páginas são **órfãs na navegação atual**. Não devem aparecer em manuais como telas acessíveis até receberem rota, autorização e, quando aplicável, menu.

## Paths inexistentes

- `/financeiro-aberto`
- `/tagsKanban`

## Modelo real de acesso

O frontend não usa `Roles` como fonte central. A decisão combina:

1. `user.super`;
2. `user.profile` (`admin` ou `user`; alguns trechos legados aceitam `super`);
3. `user.permissions[]`, com permissão exata ou wildcard como `campaigns.*`;
4. flags legadas, como `showDashboard`, `allowRealTime`, `allowConnections` e `allTicket`;
5. flags do plano, como `useCampaigns`, `useKanban`, `useOpenAi`, `useIntegrations`, `useSchedules`, `useInternalChat` e `useExternalApi`;
6. tipo da empresa (`platform`, `whitelabel`, `direct`).

Ocultar um menu não substitui autorização no backend. A tela `/settings` bloqueia explicitamente `profile = user`.

## Personas funcionais

- **Atendente:** `profile = user`, permissões operacionais e filas; pode receber flags adicionais.
- **Supervisor operacional:** não é profile próprio; é usuário com permissões/flags ampliadas.
- **Admin da empresa:** `profile = admin`, limitado à empresa e ao plano.
- **Parceiro:** usuário de empresa `whitelabel`, com gestão das empresas-filhas.
- **Dono da plataforma:** `super = true`, normalmente na empresa `platform`.

## Pendências

- Proteger no backend os dashboards/endpoints `ticketsUsers` e `ticketsDay`, hoje registrados como sem autenticação.
- Reativar e configurar Helmet; atualmente está comentado.
- Padronizar capitalização das rotas Kanban e decidir se rotas úteis sem menu devem ganhar navegação.
- Remover ou integrar páginas órfãs para evitar promessa funcional baseada apenas na existência do componente.
