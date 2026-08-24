# Diário de navegação

## Sessão

- Data: 2026-08-22
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health ok (`dev:fast`)
- Personas na UI: Beatriz, Carlos, Ana Parceira, Diego (login API também dono)
- Screenshots: `entregaveis/extras/screenshots/` (`f1`–`f26`)

## Lista `/tickets` (corrigido na prática)

A API **não** lista sem `queueIds`. Com filas do usuário, a UI lista.

- Beatriz (`queueIds=[6]`): Maria (open) + Carla (pending na Suporte). João **não** aparece (fila Vendas).
- Carlos (`showAll` + filas 6/7/8): Maria, Ana, Mercado Central, João pending, Pedro closed.
- Diego (`allTicket`): Ana (dele) + João pending em Vendas.

## Jornada do ticket (UI)

| Passo | Resultado |
|-------|-----------|
| Login atendente | `/tickets` (home `/` dá 403) |
| Lista | Maria + Carla; print `f2` |
| Chat Maria | 3 mensagens do seed; print `f3` |
| `/` respostas rápidas | `/saudacao` e `/aguardar`; print `f4` |
| Aceitar Carla | Virou open atribuída à Beatriz; print `f6` |
| Modal transferir | Abre (fila/usuário/obs); print `f7` |
| Confirmar transferência | **Falhou** no backend: WhatsApp DISCONNECTED (`erro ao atualizar o ticket 13`) |
| Envio real | Não feito — precisa escanear QR |
| Contatos da atendente | Lista **0** — tags hierárquicas exigem tag pessoal `#` |
| Contatos do admin | 6 contatos do seed; print `f21` |

## WhatsApp

- Cliente Demo: gerou QR Baileys (`whatsappId=4`); modal “Leia o QrCode”; prints `f16`/`f17`.
- Sem celular nesta sessão: **não** houve mensagem real.
- Transferência/encerramento que disparam mensagem no canal quebram enquanto a sessão não estiver `CONNECTED`.

## Parceiro na UI

- Login `parceiro@taktchat.local` — badge **Parceiro**.
- Menus **Minhas empresas** e **Licenças**.
- Empresas (1): Cliente Demo Kit (id 5, filho, plano 1, venc. 31/12/2027) — print `f23`.
- Licenças: Cliente Demo Kit **Ativa** 20/08/2026–21/08/2027, recorrência mensal — print `f24`.

## Outros

- Overlay “API indisponível” no primeiro paint: clicar **Tentar novamente** (backend já estava no ar).
- Frontend: `unset PORT && PORT=3000` — não herdar 8080 do backend.
- Seed extra: contato/ticket **Carla Mendes** na fila Suporte (para a atendente aceitar).

## Frontend PORT

Não herdar `PORT=8080` do `.env` do backend ao subir o frontend. Usar `PORT=3000`.
