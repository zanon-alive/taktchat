# Manual — Atendente

## Este manual é para você se…

Você entra com um usuário **atendente** (`profile = user`) e o trabalho é conversar com o cliente. Login de teste: `atendente@taktchat.local`.

## O que você não precisa fazer

Conectar WhatsApp, criar usuário, plano, campanha em massa, empresa-filha.

## Primeiro acesso

1. Abra o sistema e faça login (e-mail e senha).
2. Ignore o dashboard se aparecer **403** — atendente não vê essa tela.
3. Vá em **Atendimento** (`/tickets`).

## Tarefas do dia a dia

### Como aceitar um ticket pendente

1. Abra Atendimento.
2. Na lista de **aguardando**, localize um contato da **sua fila** (ex.: Carla Mendes na Suporte). João Oliveira fica em Vendas — só aparece para quem tem essa fila (admin/supervisor).
3. Aceite o atendimento.
4. O ticket passa a ser **seu** (status aberto). Validado na UI em 2026-08-22.

### Como responder

1. Abra o chat do ticket (ex.: Maria Silva).
2. Leia o histórico.
3. Digite a resposta ou use resposta rápida (`/saudacao`).
4. Envie. Com WhatsApp desconectado, o envio real falha — na operação real a conexão precisa estar verde.

### Como usar tag

1. No ticket aberto, escolha uma tag (ex.: Urgente).
2. Isso ajuda o supervisor a filtrar.

### Como transferir

1. No ticket, ação **Transferir** (ícone na lista ou no chat).
2. Escolha fila e/ou colega. Observação é interna (não vai ao cliente).
3. Confirme. Com WhatsApp desconectado, o backend pode falhar ao persistir (`erro ao atualizar o ticket`) — o modal abre, mas a troca de fila só completa com a conexão `CONNECTED`.

### Como encerrar

1. Ação **Encerrar** / finalizar.
2. Só faça quando o assunto acabou. Nova mensagem do cliente abre **outro** ticket, já na lane de entrada do Kanban (se a empresa usar o quadro). Encerrar aplica a lane configurada pelo admin (ex.: Fechado ganho).

## Telas que você usa

Atendimento, contatos, respostas rápidas, tags, ajudas. Tempo real e dashboard só se o admin liberar (persona supervisor).

## Quando der erro

| Situação | O que fazer |
|----------|-------------|
| 403 na home | Ir para `/tickets` |
| Não envia mensagem | Avisar o admin: conexão WhatsApp |
| Não vê o ticket | Pode ser de outra fila; pedir transferência ou permissão |
| Contatos (0) | Tags hierárquicas: user sem tag `#PESSOAL` não vê a agenda. Admin vê todos |
| Fora do horário | Admin ajusta jornada (`startWork` / `endWork`) |
| Acesso bloqueado | Licença ou parceiro; não é problema seu |

## O que pedir para outro papel

- Admin: conexão, filas, seu usuário nas filas certas
- Supervisor: tickets de outros, relatórios
