# Lacunas e perguntas

## Respondido pelo usuário (2026-08-21)

| Pergunta | Resposta |
|----------|----------|
| Logins por persona | Criar no banco local se não houver — **feito** (`09-logins-locais.md`) |
| Popular dados para ficar visual | **Feito** (filas, contatos, tickets, tags, mensagens, Carla) |
| Tamanho das apresentações | Padrão **e** longa |
| Público da comercial | Cliente final **e** parceiro |
| Screenshots | Sim — `f1`–`f26` |
| README incompleto | Ponteiro do kit no README da raiz |
| Ticket | Profundidade extra — `10-fluxo-do-ticket.md` + UI |
| Melhorias sugeridas | Aplicadas nos guias **antes** da navegação |

## Feito na navegação (2026-08-22)

- Lista de tickets com `queueIds` das filas do usuário.
- Aceite Carla; chat Maria; modal transferir; QR Baileys; empresas/licenças do parceiro.
- Schema local já tem `Companies.type`, `parentCompanyId`, Licenses.

## Ainda aberto (fora do código desta branch)

1. Captura **real** do WhatsApp no celular — hoje há ilustração de IA (`pendente-whatsapp-celular.png`).
2. Copy dos slides (login comercial) em MD/`decks.js`.
3. Tag pessoal `#` na atendente se quiser agenda de contatos no perfil `user`.

WhatsApp da Cliente Demo Kit no ambiente **local** já está CONNECTED (envio e transferência persistida). Seed de demo **não** vai para produção.

Kanban e CRM de pipeline: [15-pendencias-produto-outras-branches.md](15-pendencias-produto-outras-branches.md) — branch `feat/` própria. Overlay de API e token de signup: nesta branch.

## Divergências código × docs antigos

- Docs falavam em profile supervisor/financeiro. Código: `admin` / `user` + flags + `super`.
- Menu Kanban `/kanban` vs rota `/Kanban`.
- `/reports` e `/todolist` podem estar fora do menu.
- Campanhas dependem de plano / `cshow`.
- Lista `/tickets` sem `queueIds` volta count 0 (comportamento do produto, não bug do seed).
