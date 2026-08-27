# Landing, widget e canais de entrada

## Landing `/landing` (v2)

Página pública de conversão (título: *Atendimento no WhatsApp, no mesmo lugar*). Funil:

- Hero com print real do produto
- Galeria (tickets, kanban, fluxos)
- Proposta, funcionalidades, planos (valores vêm da API; não inventar)
- Cadastro direto se habilitado + lead
- FAQ

**CTAs:** nav **Começar**; no desktop o hero tem **Falar no WhatsApp** + **Ver em 1 min** + **Começar agora**. No celular/tablet o WhatsApp do hero some (fica o FAB). FAB WhatsApp no canto inferior direito, também em `/tour` e `/login`.

O FAB abre `wa.me` com mensagem de interesse, sem formulário. Número: `REACT_APP_NUMBER_SUPPORT` (só dígitos). Empilha acima do banner de cookies e abaixo do chat do site, se os dois existirem.

O diálogo **Servidor de API indisponível** não cobre `/landing`, `/landing/v1`, `/tour` nem `/lgpd`.

## Tour `/tour`

Cinco slides, sem login. **Voltar** e logo levam a `/landing`. Último slide: WhatsApp, falar com especialista e ir para a landing. `/p/tour` redireciona para `/tour`.

## Landing arquivada `/landing/v1`

Copy antiga (prova social / uptime) pode permanecer. `noindex`. Usa o mesmo FAB compartilhado.

## Login `/login`

Marca TaktChat, e-mail, senha, lembrar, esqueci senha. FAB WhatsApp visível; some enquanto o aviso de API está aberto.

## Widget e canais

Configuração em **Settings** (admin): canais de entrada, `useSiteChat`, snippet do `widget.js` e token por empresa. Cadastro público `/signup` e `/signup-partner`.

`widget.js` respeita `--taktchat-site-chat-bottom` para não cobrir o FAB da vitrine.

## Status

Landing, tour e FAB: **exercitados em produção** (`taktchat.com.br`, 2026-08-27, PRs #40 e #41). Chat do site: **implementado**; o botão não estava injetado nessa validação (settings).

## Limitação

O Lead público escolhe a primeira empresa quando não recebe seleção explícita. Não apresentar esse fluxo como roteamento multiempresa maduro.
