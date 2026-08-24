# Manual — Administrador da empresa

## Este manual é para você se…

Você administra **uma empresa cliente** (não a plataforma inteira). Login de teste: `admin.cliente@taktchat.local` (Cliente Demo Kit).

## O que você não precisa fazer

Criar outra empresa, cobrar parceiro, anúncio global da plataforma.

## Primeiro acesso

1. Login.
2. Dashboard deve abrir (você tem `dashboard.view`).
3. Conferir **Conexões**: precisa de um WhatsApp conectado para atender de verdade.
4. Conferir **Filas** e **Usuários** (quem está em qual fila).

## Tarefas

### Como deixar o time atendendo

1. Conexões → nova conexão → Baileys (QR) ou Oficial (Meta).
2. Filas: Suporte / Vendas / etc., com mensagem de saudação.
3. Usuários: atendente `user` nas filas; supervisor com dashboard e “todos os tickets” se quiser.
4. Pedir para o atendente entrar em `/tickets` (não na home, se ele não tiver dashboard).

### Como acompanhar a operação

Dashboard, tempo real (`/moments`), tickets abertos/pendentes, tags.

### Como disparar campanha (se o plano permitir)

Campanhas → lista de contatos → criar disparo → respeitar cadência (anti-ban / política Meta).

## Telas

Dashboard, tickets, contatos, filas, usuários, conexões, settings, financeiro da empresa, campanhas/flow/IA se o plano tiver.

## Quando der erro

| Situação | O que fazer |
|----------|-------------|
| ERR_ACCESS_BLOCKED_PLATFORM | Licença inativa — falar com o parceiro ou com a plataforma |
| QR não gera | Sessão/Baileys; ver logs do backend |
| Atendente 403 | Normal na home; liberar dashboard só se quiser |

## O que pedir para outro papel

Parceiro ou dono: licença, plano, limites. Atendente não configura conexão.
