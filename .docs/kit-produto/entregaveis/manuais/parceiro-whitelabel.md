# Manual — Parceiro (whitelabel)

## Este manual é para você se…

Você revende o Taktchat. Empresa `type = whitelabel`. Login de teste: `parceiro@taktchat.local` (Parceiro Demo Kit).

## O que você não precisa fazer

Operar o ticket do cliente final no dia a dia (eles têm o próprio admin). Mexer no servidor.

## Primeiro acesso

1. Login. Sem licença ativa a plataforma bloqueia (`ERR_ACCESS_BLOCKED_PLATFORM`).
2. Badge **Parceiro**. Menus **Minhas empresas** (`/companies`) e **Licenças** (`/licenses`) — validados na UI em 2026-08-22.

## Tarefas

### Como cadastrar um cliente

1. Empresas → nova empresa filha (`direct`).
2. Associar plano e licença (trial ou paga).
3. Enviar o login do admin da empresa-filha.
4. Opcional: link `/signup-partner` com o token do parceiro.

### Como bloquear um cliente inadimplente

Ação de bloquear acesso da empresa-filha (não confundir com apagar dados).

## Fora do seu manual

Código, Traefik, migrations. Cobrança consolidada que o **dono** vê em `/partner-billing-report`.

## O que aparece no ambiente local

- **Minhas empresas:** Cliente Demo Kit (id 5, Plano 1, venc. 31/12/2027), e-mail `admin.cliente@taktchat.local`.
- **Licenças:** mesma empresa, status **Ativa**, recorrência mensal, fim 21/08/2027.
- Prints: `f22`–`f24` em `entregaveis/extras/screenshots/`.
