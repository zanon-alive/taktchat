# Comparativo UX — antes vs depois das ondas A–D

**Data da revalidação:** 2026-08-27  
**Ambiente:** `http://localhost:3000`, Cliente Demo Kit. Sem mutar WhatsApp nem enviar mensagem.  
**PRs (empilhados, mergear nesta ordem):** [#43](https://github.com/zanon-alive/taktchat/pull/43) A → [#44](https://github.com/zanon-alive/taktchat/pull/44) B → [#45](https://github.com/zanon-alive/taktchat/pull/45) C → [#46](https://github.com/zanon-alive/taktchat/pull/46) D.

Cores do Taktchat mantidas. Sem tema TeleCX.

O levantamento original está em [levantamento-pre-producao.md](./levantamento-pre-producao.md). Este arquivo registra o **mesmo tipo de percurso no browser**, depois das quatro ondas.

## Como foi revalidado

| Modo | O que foi visto |
|------|-----------------|
| Tema **claro** ~1100px | Carlos Admin: Conexões, phrase-lists, chats, helps, tickets (`/` overlay), modal Desconectar (cancelado), Flowbuilder, Kanban, Relatórios |
| Tema **escuro** | `preferredTheme=dark` + classe `dark` no `html`. Conexões em ~1100px; Usuários (tabela) em viewport temporário 1466px, depois restaurado; Tags; phrase-lists |
| **Persona atendente** | Beatriz: login, home `/` → `/tickets` (sem 403), menu sem Administração, saudação bem-vindo(a), Espiar ausente nos tickets dela |
| **Login público** | Labels **E-mail** / **Senha** |

Critério da §9 do levantamento, no browser:

| Critério | Resultado |
|----------|-----------|
| Tema claro ⇒ superfícies claras | Sim. Conexões: card `rgb(255, 255, 255)`, título `rgba(0, 0, 0, 0.87)`, `html.dark` = false |
| Tema escuro ⇒ chrome + tabelas + cards escuros, headers legíveis | Sim. Body/AppBar/drawer `rgb(18, 18, 18)`; card `rgb(31, 41, 55)` só com `html.dark`; título branco; Usuários: thead `rgba(255,255,255,0.08)` + texto `rgb(255,255,255)` |
| Lista vazia ⇒ mensagem + próximo passo | Sim. phrase-lists, chats |
| Nenhuma chave i18n crua no AppBar | Sim. Botão **Idioma** |
| Confirmar destrutivo ⇒ rótulo da ação + cancelar | Sim. Modal: título/CTA **Desconectar**, **Cancelar** (não Ok). Cancelado. |
| Persona atendente ⇒ menu do que usa; 403 não é home | Sim. `/` redireciona para `/tickets` |

## Conferido no browser (depois)

| Tela / gesto | Antes (levantamento) | Depois (esta passada) |
|--------------|----------------------|------------------------|
| `/connections` ~1100px claro | Card `rgb(31, 41, 55)`, título preto no carvão | Card `rgb(255, 255, 255)`, título preto no branco |
| `/connections` escuro | Chrome claro + conteúdo escuro; título preto no carvão | Chrome e body `rgb(18,18,18)`; card carvão **intencional**; título `rgb(255,255,255)` |
| AppBar | `noWrap` cortava; globo = chave crua; “bem-vindo” | “seja **bem-vindo(a)**”; botão **Idioma** |
| `/phrase-lists` | Vazio preto/branco | Empty: “Nenhuma campanha de fluxo” + CTA **Campanha** (claro e escuro, texto branco no dark) |
| `/chats` | Só NOVA + ilha vazia | “Nenhuma conversa. Clique em Nova…” |
| `/helps` | “Central de Ajuda **(0)**” | “Central de Ajuda” sem contador falso |
| Overlay `/` no ticket | `//aguardar … - …` duplicado | Lista **`/aguardar`**, **`/saudacao`** (sem concatenar valor) |
| Modal Desconectar | CTA **Ok** | CTA **Desconectar** + Cancelar |
| Flowbuilder claro | Linha azul-marinho `#1E293B` | Linha papel `rgb(255,255,255)` + borda esquerda `rgb(37, 99, 235)` |
| `/kanban` ~1100px | 4ª coluna “Q…” truncada | Títulos **Em aberto**, **Progresso**, **Suporte** visíveis; colunas ≥ ~220px |
| `/reports` ~1100px | Filtros com `20vh` + scroll horizontal forte | Altura do paper ~134px (`height: auto`). Ainda há overflow residual (~15px) e o botão **Aplicar Filtro** fica estreito (~64px) |
| `/login` | Email / Password | **E-mail** / **Senha** |
| Usuários tabela dark (1466px) | Headers `grey[100]` + texto claro = ilegível | Texto branco no paper escuro |
| Beatriz `/` | 403 Forbidden | Redireciona para `/tickets` |
| Beatriz menu | Grupo Administração vazio | Sem Administração; itens: Atendimentos, Respostas rápidas, Kanban, Funil, Contatos, Tags, Ajuda |
| Beatriz Transferir | Via UI sem checar permissão | Kit **inclui** `tickets.transfer` no login; o ícone aparece **porque a permissão existe**. Não é regressão da onda C |
| Beatriz Espiar | Também no ticket dela | Ausente nos tickets Carla/Maria |

## Por ID (P0–P2 das ondas)

| ID | Status após ondas | Evidência |
|----|-------------------|-----------|
| P0-1 | Corrigido | Cards claros no tema claro mesmo em 1100px |
| P0-2 | Corrigido no recorte | Desconectar no papel claro; no dark o roxo claro (`rgb(206,147,216)`) fica no card carvão intencional |
| P0-3 | Corrigido | Empty + CTA em phrase-lists |
| P0-4 | Corrigido | Fluxo “Boas-vindas Demo Kit” sem fundo navy |
| P0-5 | Corrigido no código + Tags dark | Títulos de seção brancos no dark |
| P0-6 | Corrigido | Headers Usuários no dark: branco sobre paper |
| P0-7 | Corrigido | AppBar, body e drawer no mesmo `rgb(18,18,18)` |
| P0-8 | Corrigido | Empty no chat interno |
| P0-9 | Parcial | Contador `(0)` saiu; mix de layouts dos cards **não** |
| P0-10 | Corrigido | Título branco no card dark; preto no card claro |
| P0-11 | Aberto | Mercado Central ainda **ATENDENDO** + **FECHADO GANHO** (decisão de produto) |
| P1-8 | Parcial | CTAs de Conexões ainda quebram linha em 1100px (`wrap` reduz, não elimina) |
| P1-15 | Parcial | Sem 20vh; overflow residual |
| P1-16 | Corrigido no recorte | Colunas Kanban sem truncar “Q…” |
| P1-17 | Corrigido | Rótulo Desconectar |
| P1-18 | Corrigido | Overlay só `/{code}` |
| P1-19 | Corrigido | Home da atendente → `/tickets` |
| P1-20 | Comportamento alinhado à permissão | Kit demo **tem** `tickets.transfer`; UI mostra o botão |
| P1-22 | Corrigido | Login em PT |
| P2-1 | Corrigido | Saudação sem corte `noWrap` |
| P2-3 | Corrigido | Idioma |
| P2-12 | Corrigido | bem-vindo(a) |
| P2-13 | Corrigido | Sem grupo Administração vazio |
| P2-14 | Corrigido | Sem Espiar no ticket próprio |

## Por onda

| Onda | IDs | PR |
|------|-----|----|
| A | P0-1, P0-2 (claro), P0-7, P0-10 | #43 |
| B | P0-4, P0-5, P0-6 | #44 |
| C | P0-3, P0-8, P0-9 (contador), P1-17–P1-20 | #45 |
| D | P1-8, P1-15, P1-16, P1-22, P2-1, P2-3, P2-12, P2-14 | #46 |

## Ainda aberto (não nesta série)

- P0-11: ticket ATENDENDO com lane Fechado ganho (Kanban por arraste)
- P0-9 restante: mix de layouts nos cards de Ajuda
- P1-12: Settings ainda é parede de selects
- P2-2: drawer só ícone
- P1-8 / P1-15: polimento residual em 1100px (CTAs e filtros)
- Diego, ~375px, toast após mutar demo — fora do recorte original

## Como mergear

1. Merge #43 em `main`
2. Merge #44 (base `feat/ux-onda-a`; após o merge da A, retarget para `main` se o GitHub pedir)
3. Idem #45 e #46

Ou mergear a cadeia A←B←C←D na ordem dos PRs.
