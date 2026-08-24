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

Registrado no roadmap do projeto (`.docs/visao-geral/roadmap.md`, seção Documentação → Kit de produto) para outro dia:

1. Completar prints `pendente-*.png` do player `/apresentacoes`.
2. Escanear o QR Baileys até `CONNECTED` (envio, transferência persistida, encerrar).

Outros, sem data:

3. Tag pessoal `#` na atendente se quiser agenda de contatos no perfil `user`.
4. Overlay “API indisponível” no first paint — retry.

## Divergências código × docs antigos

- Docs falavam em profile supervisor/financeiro. Código: `admin` / `user` + flags + `super`.
- Menu Kanban `/kanban` vs rota `/Kanban`.
- `/reports` e `/todolist` podem estar fora do menu.
- Campanhas dependem de plano / `cshow`.
- Lista `/tickets` sem `queueIds` volta count 0 (comportamento do produto, não bug do seed).
