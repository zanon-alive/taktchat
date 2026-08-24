# Atendimento e tickets

**Prioridade para cliente novo.** Situação desta versão: seed local no Cliente Demo Kit + login real da atendente Beatriz. WhatsApp da empresa demo está `DISCONNECTED` — mensagens ao vivo ficam para a rodada com WhatsApp real.

## Para que serve

Centralizar cada conversa com um cliente num **ticket**: fila, responsável, histórico, tags e status.

## Onde fica

- Menu: Atendimento (ícone WhatsApp)
- URL: `/tickets`
- Relacionados: `/moments` (tempo real), `/Kanban`

## Quem usa

| Persona | Papel no ticket |
|---------|-----------------|
| Atendente | Aceita, responde, tagueia, encerra (o que a permissão deixar) |
| Supervisor | Vê mais tickets (`allTicket`), dashboard e tempo real |
| Admin da empresa | Tudo da empresa + filas, usuários, conexão |
| Dono / parceiro | Não é o dia a dia; podem ter o mesmo menu de admin na própria empresa |

Permissões da Beatriz (API de login): `tickets.view`, `tickets.close`, `contacts.view`, `quick-messages.view`, `tags.view`, `helps.view`.

## Como o ticket nasce

### Cliente fala primeiro (entrada)

Mensagem no WhatsApp (Baileys ou API Oficial) ou no chat do site → contato criado/localizado → o sistema reutiliza ticket ainda aberto ou cria outro (`pending`, `bot` ou `lgpd`). O painel atualiza por Socket.IO.

**Nesta versão:** não exercitado ao vivo (conexão desconectada). Simulado no banco.

### Equipe fala primeiro (saída)

Contatos → iniciar conversa. O ticket costuma nascer `open` já com o usuário. Não pode haver dois abertos do mesmo contato na mesma conexão.

## Estados

| Status | Significado | Exemplo no seed |
|--------|-------------|-----------------|
| `pending` | Na fila, sem atendente | João Oliveira / Vendas |
| `open` | Em atendimento | Maria Silva / Beatriz / Suporte |
| `closed` | Encerrado | Pedro Santos |
| `bot` / `lgpd` / `nps` / `group` | Automação, privacidade, pesquisa, grupo | Não populados nesta versão |

## Como se trabalha (receita)

1. Abrir **Atendimento**.
2. Na coluna de **pendentes**, aceitar o ticket (João).
3. Ler o histórico no chat (Maria tem 3 mensagens de exemplo).
4. Responder com texto ou resposta rápida (`/saudacao`, `/aguardar`).
5. Aplicar **tag** (Maria = Urgente).
6. **Transferir** para outra fila ou colega, se não for com você.
7. **Encerrar** quando o assunto acabar.
8. Se o cliente falar de novo, o sistema reabre ou cria outro conforme a conexão (`timeCreateNewTicket`).

## Dados de demonstração (Cliente Demo Kit)

| Ticket | Contato | Status | Fila | Responsável |
|--------|---------|--------|------|-------------|
| 8 | Maria Silva | open | Suporte | Beatriz |
| 9 | João Oliveira | pending | Vendas | — |
| 10 | Ana Costa | open | Suporte | Diego |
| 11 | Mercado Central | open | Financeiro | Carlos |
| 12 | Pedro Santos | closed | Suporte | Carlos |

## Dependências

WhatsApp conectado para envio real; filas e usuários vinculados; permissão `tickets.view`.

## O que isto não é

Não é um helpdesk com protocolo visível para o cliente no WhatsApp. É a conversa operacional da equipe.

## Status na navegação

- Login da atendente: **exercitado** (Boas-vindas “Cliente Demo Kit”; dashboard `/` retorna **403** — esperado sem `dashboard.view`).
- Lista/chat de tickets na UI: **parcial** (menu estreito / SPA; API de listagem com filtro padrão voltou vazia neste ambiente — dados confirmados no banco).
- Mensagem WhatsApp ao vivo: **não exercitado**.

## Screenshots

- `extras/screenshots/f1-login.png` (tela de login)
- `extras/screenshots/f1-atendente-tickets-lista.png` (Beatriz autenticada; home 403)

Versão narrativa completa: [../extras/fluxo-do-ticket.md](../extras/fluxo-do-ticket.md).
