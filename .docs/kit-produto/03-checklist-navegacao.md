# Checklist de navegação

Marcar a coluna **Status**:

| Código | Significado |
|--------|-------------|
| `V` | Visitado e com ficha |
| `B` | Bloqueado (permissão, plano, erro, conexão) |
| `N` | Não aplicável neste ambiente |
| (vazio) | Pendente |

Anotações longas, bugs e divergências → `11-diario-navegacao.md`.  
Uma ficha por tela → `08-ficha-tela.template.md`.

## 0. Ambiente

- [x] Frontend http://localhost:3000
- [x] Health http://localhost:8080/health
- [x] Login com `atendente@taktchat.local` (persona principal do ticket)
- [x] Login com `admin.cliente@taktchat.local`
- [x] Login com `dono@taktchat.local` (API)
- [x] Login com `parceiro@taktchat.local`
- [x] Login com `supervisor@taktchat.local`

Não usar `docker compose down -v`. Não apontar `.env` para produção.

## 1. Superfície pública

| Status | Rota | Observar |
|--------|------|----------|
| V | `/landing` | Pitch, planos, cadastro direto (sessão anterior) |
| V | `/login` | `f1-login.png` |
| N | `/signup` | Não percorrido nesta rodada |
| N | `/signup-partner` | Documentado; sem print |
| N | `/forgot-password` | Link visível no login |
| V | `/docs` | Link Documentação no login |
| N | `/docs_admin` | Não aberto |

## 2. Jornada ticket (obrigatória — cliente novo)

Fazer com `atendente@taktchat.local` e repetir o que faltar com o admin.

| Status | Passo | Esperado no seed |
|--------|-------|------------------|
| V | Lista de tickets | Maria open; Carla pending (Suporte); João só admin/supervisor (Vendas) |
| V | Abrir chat da Maria | 3 mensagens de exemplo |
| V | Aceitar Carla (pending) | Virou open com a atendente |
| V | Resposta rápida `/saudacao` | Lista `/` no composer |
| V | Aplicar/ver tag | Maria = Urgente na lista |
| V | Transferir (abrir o fluxo) | Modal ok; persistir falhou (WhatsApp) |
| B | Encerrar um ticket de teste | Mesmo bloqueio de canal |
| B | Nova conversa a partir de Contatos | Atendente: lista 0; WhatsApp sem sessão |
| V | Tempo real / dashboard | Supervisor: dashboard `f26`; Painel no menu |

Detalhe conceitual: `10-fluxo-do-ticket.md`.

## 3. Menu operacional

| Status | Rota | Menu | Observar |
|--------|------|------|----------|
| V | `/` | Dashboard | Atendente 403; admin e supervisor ok |
| V | `/tickets` | Atendimento | Ver jornada 2 |
| B | `/moments` | Tempo real | Menu Painel no supervisor; reload caiu no overlay |
| V | `/quick-messages` | Respostas rápidas | `/saudacao`, `/aguardar` |
| N | `/kanban` | Kanban | Menu no admin; não aberto |
| N | `/TagsKanban` | Kanban tags | — |
| V | `/contacts` | Contatos | Atendente 0; admin 6 |
| N | `/contacts/import` | Importação | — |
| N | `/schedules` | Agendamentos | Menu no admin |
| V | `/tags` | Tags | Hierárquicas + transacional Aguardando cliente |
| N | `/chats` | Chat interno | Menu no admin |
| V | `/helps` | Ajudas | Central de Ajuda |

## 4. Administração

| Status | Rota | Menu | Observar |
|--------|------|------|----------|
| N | `/campaigns` | Campanhas | Menu Envio em Massa no admin |
| N | `/contact-lists` | Listas | — |
| N | `/flowbuilders` | Fluxos | Menu no admin |
| V | `/users` | Usuários | Beatriz, Carlos, Diego |
| V | `/queues` | Filas | Suporte/Vendas/Financeiro |
| V | `/connections` | Conexões | QR Baileys Cliente Demo |
| N | `/allConnections` | Todas | super / dono |
| V | `/financeiro` | Financeiro | Menu presente no admin/parceiro |
| V | `/companies` | Empresas | Parceiro: Cliente Demo Kit |
| V | `/licenses` | Licenças | Parceiro: Ativa até 2027 |
| N | `/partner-billing-report` | Cobrança | super |
| N | `/reports` | Relatórios | — |

## 5. Jornadas settings / widget / landing

| Status | Aba ou fluxo | Observar |
|--------|--------------|----------|
| V | Configurações gerais | Opções: saudações, bot texto, LGPD |
| V | Canais de entrada | Aba visível |
| V | Widget chat do site | Aba visível |
| N | Abrir `/landing` logado | Landing já descrita |

## 6. Encerramento da sessão de navegação

Preenchido em `11-diario-navegacao.md`.
