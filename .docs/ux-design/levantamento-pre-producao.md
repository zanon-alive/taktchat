# Levantamento UX e Design — pré-produção

**Branch do inventário:** `docs/ux-design-pre-producao`  
**Data:** 2026-08-27 (inventário). Implementação: ondas A–D nos PRs #43–#46.  
**Escopo deste arquivo:** identificar e priorizar. **Não é o registro da correção** — o antes/depois no browser está em [comparativo-ondas-abcd.md](./comparativo-ondas-abcd.md).  
**Ambiente:** `http://localhost:3000`. Admin: Carlos Admin. Atendente: Beatriz (`atendente@taktchat.local`).  
**Viewport desta passada:** `innerWidth = 1100`, `min-width: 1200px` = false (layout de cards).

O Taktchat está prestes a produção. O painel mistura três linguagens visuais: MUI v5 com tema claro/escuro, cards Tailwind que escutam o tema do **sistema operacional**, e telas legadas com tokens de `frontend/src/styles/styles.js`.

---

## 1. Como este levantamento foi feito

Percurso **no browser** (não só prints), nas duas paletas, na sessão local.

| Modo | Como foi visto |
|------|----------------|
| Tema **claro** desktop (~1466px) | Quase todas as telas do menu da empresa cliente + landing, tour, LGPD |
| Tema **escuro** desktop | Dashboard, Atendimentos, Conexões, Usuários, Tags, Chat interno, Campanhas de fluxo, Configurações IA |
| **~1100px** (zoom da ferramenta, `isDesktop = false`) | Percurso **no browser** em tema claro (menu da persona cliente) + amostra escura em `/connections`. Card Tailwind reproduzido de verdade, não só pelo código. Ver §4.31 |
| **Percurso de tarefa** | Admin: abrir ticket, `/` respostas rápidas, modal Transferir, confirmar Desconectar/Deletar (cancelados). Ver §4.32 |
| **Persona atendente** | Beatriz: menu reduzido, tickets/contatos, 403 em rotas de admin, modal Transferir ainda abre. Ver §4.33 |

**Público (sem login):** `/landing`, `/tour`, `/lgpd`. **`/login` visto após logout.** `/signup` redirecionou para o Dashboard (já autenticado).  
**Plataforma:** `/companies` redirecionou para `/` (esperado para empresa cliente). `/allConnections`, `/licenses`, `/apresentacoes` não entram no menu desta persona.

| Prioridade | Significado |
|------------|-------------|
| **P0** | Quebra percepção de produto pronto: tema inconsistente, contraste ilegível, tela “em branco” |
| **P1** | Padrão quebrado, mas a tela ainda é usável |
| **P2** | Polimento (densidade, labels, i18n, chrome do layout) |

---

## 2. Causas raiz (confirmadas no percurso)

### 2.1 Card Tailwind vs tema do app (P0-1)

Abaixo de 1200px várias listagens usam `dark:bg-gray-800`. O Tailwind **não** tem `darkMode: 'class'`: `dark:*` segue o SO, não o toggle MUI (`preferredTheme`). **Reproduzido no browser em 1100px** (tema claro do app): card `rgb(31, 41, 55)` em Conexões, Usuários, Campanhas, Arquivos, Filas, Respostas rápidas, Prompts, Integrações e Relatórios. Paginação Tailwind (`dark:bg-gray-800` nos botões) também fica carvão.

O título do card (`font-semibold text-sm`, **sem** `dark:text-white`) herda o texto MUI `rgba(0, 0, 0, 0.87)` — **preto no carvão**. Medido em `/connections`: nome “WhatsApp Cliente Demo Kit” ilegível. O mesmo padrão está em Usuários e Filas.

### 2.2 Header de tabela no tema escuro (P0-6) — **novo, visto no browser**

O `tableHead` das listagens HTML usa `backgroundColor: theme.palette.grey[100]` (sempre cinza **claro**) e `color: theme.palette.text.secondary` (no dark, texto **claro**). Resultado: **CHANNEL / NOME / ID praticamente invisíveis** em Conexões e Usuários no tema escuro. O mesmo padrão está em Campanhas, Arquivos, Filas, Contatos, Respostas rápidas, Relatórios, etc.

### 2.3 Tema escuro incompleto / dessincronizado (P0-7)

Em mais de um momento o chrome (AppBar + sidebar) ficou **claro** com os cards/conteúdo **escuros** (Dashboard após navegar por rotas públicas com `preferredTheme=dark`). `layout` usa `fancyBackground` / `barraSuperior`, mas o `body` chegou a permanecer `rgb(255,255,255)` com Papers em `rgb(18,18,18)`.

### 2.4 Listagens legadas (`styles.js`)

`colorTopTable` = `#F8FAFC` e `colorBackgroundTable` = `#1E293B`. Em claro: headers fantasma + **linha azul-escura** no Flowbuilder. Em escuro: título “Campanhas” ilegível e vazio preto sem mensagem.

---

## 3. Inventário por prioridade

### P0

| ID | Problema | Onde |
|----|----------|------|
| P0-1 | Cards e paginação Tailwind carvão no tema claro (`dark:bg-gray-800` segue o SO) | Conexões, Usuários, Campanhas, Arquivos, Filas, Quick messages, Prompts, Integrações, Relatórios (visto em 1100px); demais páginas com a mesma classe |
| P0-2 | Contraste do Desconectar no card escuro (`rgb(156, 39, 176)` no carvão) | Connections / AllConnections — **medido em 1100px** |
| P0-3 | Campanhas de fluxo sem empty state (vazio preto/branco) | `/phrase-lists` — **visto claro e escuro** |
| P0-4 | Fluxos: headers invisíveis + linha azul-escura no tema claro | `/flowbuilders` |
| P0-5 | Tags: empty state órfão; no **escuro** títulos de seção brancos no bloco branco | `/tags` |
| P0-6 | Headers de tabela `grey[100]` + `text.secondary` ilegíveis no dark | Usuários, Conexões e demais HTML tables |
| P0-7 | Tema escuro dessincronizado (chrome claro + conteúdo escuro) | Dashboard e após ir a landing/signup |
| P0-8 | Chat interno sem orientação; no dark o painel da lista vira ilha cinza-clara | `/chats` |
| P0-9 | Ajuda: contador `(0)` com 15 cards; mix de layouts; cards de baixo sem botão/texto | `/helps` |
| P0-10 | Título do card Tailwind preto no fundo carvão (`font-semibold text-sm` sem `dark:text-*`) | Conexões, Usuários, Filas (mesmo markup nas outras listagens Tailwind) |
| P0-11 | Ticket **ATENDENDO** com tag **FECHADO GANHO** — status e lane se contradizem. **Pode ser Kanban (arrastar lane sem encerrar), não só chip.** Decidir antes de “corrigir”. | Mercado Central #15 (Admin) |

### P1

| ID | Problema | Onde |
|----|----------|------|
| P1-1 | Dois padrões de listagem (tabela HTML vs Grid `styles.js`) | phrase-lists, flowbuilders vs Users/Campaigns |
| P1-2 | Headers `text.secondary` + uppercase no **claro** (contraste fraco, mas legível) | Contatos, QuickMessages, Users… |
| P1-3 | Ícone de sort `↕` parece “:” | Contatos, Usuários |
| P1-4 | Coluna CIDADE/UF só com `-` | Contatos (dado da demo) |
| P1-5 | Coluna anexo 300px para “Sem anexo” | Quick messages |
| P1-6 | Quatro ações apertadas por linha | Contatos |
| P1-7 | Scroll interno da tabela | Contatos; Usuários mostrou 4 de 8 na viewport |
| P1-8 | CTAs de Conexões quebram em 2 linhas | `/connections` — **confirmado em 1100px** |
| P1-9 | Help box de tags saturado | `/tags` claro e escuro |
| P1-10 | Empty só texto, sem CTA; paginação em lista zerada | Arquivos, Campanhas, Financeiro, Prompts, Integrações |
| P1-11 | Relatórios: 12 colunas + campo de busca duplicado; rota **sem menu** | `/reports` |
| P1-12 | Configurações: parede de 16 selects sem agrupamento | `/settings` |
| P1-13 | Tickets: tags demais no card; tooltip “Abertos” colado | `/tickets` |
| P1-14 | Painel: masonry irregular no desktop largo; em ~1100px vira grade 2×2 mais regular | `/moments` |
| P1-15 | Relatórios: filtros não cabem — **scroll horizontal** + botão APLICAR FILTRO apertado | `/reports` em ~1100px |
| P1-16 | Kanban: colunas espremidas, 4ª coluna “Q…” truncada, botão de ação vira “C” | `/kanban` em ~1100px |
| P1-17 | Confirmação destrutiva usa o mesmo **Ok** roxo para Desconectar e Deletar | `ConfirmationModal` — Conexões |
| P1-18 | Overlay `/` de respostas rápidas duplica o texto do atalho (`//aguardar … - …`) | composer do ticket |
| P1-19 | Home `/` da atendente é **403**; ela entra em `/tickets` | Beatriz |
| P1-20 | Atendente abre o modal **Transferir Ticket** (API de permissão do kit não inclui `tickets.transfer`) | Beatriz, ticket Carla |
| P1-21 | Formulário “Adicionar usuário”: CTA abaixo da dobra; perfil default **User** em inglês | `/users` |
| P1-22 | Login: labels **Email** / **Password** em inglês | `/login` |

### P2

| ID | Problema | Onde |
|----|----------|------|
| P2-1 | Saudação da AppBar com `noWrap` (corta em janela estreita) | layout |
| P2-2 | Sidebar recolhida só ícone, ~20 itens | todas as telas logadas |
| P2-3 | Tooltip do globo = chave crua `mainHeader.buttons.language` | **todas** as telas logadas |
| P2-4 | Cards de IA altos demais; barra salvar vazia | `/ai-settings` |
| P2-5 | Dashboard: fundo/`#f5f7fa`; no dark o título “Total de atendimentos” perde contraste | `/` |
| P2-6 | Botões de ação (editar/apagar) brancos no dark | Conexões, Usuários |
| P2-7 | Hex soltos (`#6366f1`, verde menta) | Conexões e CTAs “+ …” |
| P2-8 | i18n faltando (ToDoList, toasts) | vários |
| P2-9 | Landing: a11y do banner de cookies em inglês (`Decline`/`Accept`); “Plano 1” genérico | `/landing` |
| P2-10 | LGPD: “WhatsApp: canal em configuração” | `/lgpd` |
| P2-11 | Páginas órfãs / sem menu | `mapa-frontend.md` |
| P2-12 | Saudação “seja bem-vindo” no masculino para Beatriz | AppBar |
| P2-13 | Grupo **Administração** vazio no menu da atendente | drawer Beatriz |
| P2-14 | **Espiar conversa** também no ticket que já é da própria atendente | lista `/tickets` |

---

## 4. Parecer por tela (percurso no browser)

Chrome **comum a todas as telas logadas:** sidebar só ícone; AppBar com muitos ícones; tooltip de idioma cru (`mainHeader.buttons.language`); saudação longa.

### 4.1 Dashboard — `/`

- **Claro:** cards brancos ok; empty dos gráficos existe (“Nenhum dado disponível…”); 6º card (Novos contatos) pode apertar.
- **Escuro:** cards e bloco de gráficos escuros; em um momento o **header/sidebar ficaram claros** com o miolo escuro (P0-7). Título “Total de atendimentos” azul no carvão, contraste ruim.
- **~1100px:** grade 3×2 ainda cabe; saudação da AppBar corta. Sem cards Tailwind.
- **Parecer:** usável no claro. Tema escuro não está pronto.

### 4.2 Painel — `/moments`

- **Claro:** cards de atendente brancos; grid masonry (Pendentes cai numa 2ª fileira); tags “SUPORTE” pretas pesadas.
- **~1100px:** vira grade **2×2** mais regular (melhor que o masonry largo).
- **Parecer:** informação existe; layout desperdiça largura no desktop.

### 4.3 Atendimentos — `/tickets`

- **Claro e escuro:** empty do chat **bom** (ilustração + “Selecione um ticket…”). Lista com filas repetidas nas 3 abas. Card do ticket lotado de chips (WhatsApp, fila, atendente, VIP, desfecho).
- **~1100px:** continua split-pane (~550px cada lado); chips ainda mais apertados. Sem card Tailwind.
- **Percurso de tarefa / Beatriz:** ver §4.32 e §4.33. Tag **FECHADO GANHO** em ticket ATENDENDO (P0-11); overlay `/` duplica texto (P1-18); Espiar nas próprias conversas (P2-14).
- **Parecer:** melhor empty state do produto no painel direito. Card da lista precisa de hierarquia (menos chips) e status que bata com a aba.

### 4.4 Respostas rápidas — `/quick-messages`

- Print claro: empty textual ok; coluna arquivo larga. Padrão de tabela HTML (P0-6 no dark, não reaberto nesta passada).
- **~1100px:** 2 cards carvão (`/aguardar`, `/saudacao`) + paginação Tailwind escura (P0-1).
- **Parecer:** alinhada às listagens “boas” no desktop; no zoom de cards herda P0-1.

### 4.5 Kanban — `/kanban`

- **Claro:** quadro com 7 tickets; colunas vazias (“Em aberto 0”, “Lead 0”) aceitáveis; badge “4 não lidas” muito saturado; cards densos mas legíveis.
- **~1100px:** colunas espremidas; 4ª coluna truncada (“Q…”); botão de ação vira “C” (P1-16).
- **Parecer:** um dos melhores visuais no desktop. Neste zoom o quadro não cabe.

### 4.6 Funil (lanes) — `/kanban/stats`

- **Claro:** tabela estreita no canto; muito branco; botão “ABRIR QUADRO” verde outlined isolado; headers pequenos.
- **~1100px:** mesma tabela estreita; saudação corta. Sem card Tailwind.
- **Parecer:** útil, parece relatório interno. Empty de lane zerada só mostra `0`.

### 4.7 Contatos — `/contacts`

- Print claro: empty rico (melhor das listas); CIDADE/UF = `-`; sort parece “:”; ações apertadas; scroll interno.
- **~1100px:** cards **brancos** (não usa `dark:bg-gray-800`); 8 contatos; banner “mantenha pressionado…”. Exceção positiva da família de listagens.
- **Parecer:** referência de empty state. Esconder coluna vazia ou não usar `-`.

### 4.8 Agendamentos — `/schedules`

- **Claro:** calendário FullCalendar vazio; título “(0)”; sem empty ilustrado no grid do mês; CTA verde “+ NOVO AGENDAMENTO”.
- **~1100px:** calendário ainda cabe; saudação da AppBar corta. Sem Tailwind cards.
- **Parecer:** calendário vazio é aceitável; falta uma linha “nenhum agendamento neste mês”.

### 4.9 Tags — `/tags`

- **Claro:** box azul saturado; seções ok.
- **Escuro:** títulos “Tags Pessoais / Transacionais” **brancos em bloco branco** (ilegível). Box azul continua gritante.
- **~1100px (claro):** permanece tabela; help box ocupa a largura toda. Sem card Tailwind.
- **Parecer:** P0 no dark. Suavizar help no claro.

### 4.10 Chat interno — `/chats`

- **Claro:** só botão “NOVA” e vazio total.
- **Escuro:** painel da lista vira retângulo **cinza-claro** no fundo preto.
- **~1100px:** igual — “NOVA” + ilha cinza; ainda mais desproporcional.
- **Parecer:** P0. Precisa de “Nenhuma conversa. Clique em Nova.”

### 4.11 Ajuda — `/helps`

- **Claro:** título “Central de Ajuda (0)” com dezenas de cards. Linhas 1–2 com ícone + “ACESSAR MANUAL”; depois cards só título; embaixo cards vazios.
- **~1100px:** grade 4 colunas ainda cabe; Flowbuilder já destoa no primeiro viewport. Mesmo P0-9.
- **Parecer:** P0 de consistência. Corrigir contador e um único modelo de card.

### 4.12 Envio em massa — `/campaigns`

- **Claro:** padrão de tabela “bom”; empty “Nenhuma campanha encontrada.”; paginação com 0 itens.
- **~1100px:** empty vira **card carvão** com texto branco; paginação Tailwind escura (P0-1).
- **Parecer:** estrutura ok no desktop. Neste zoom o empty é o próprio P0-1.

### 4.13 Flowbuilder (lista) — `/flowbuilders`

- **Claro:** um fluxo “Boas-vindas Demo Kit” numa **faixa azul-escura**; headers Nome/Status/Ações quase invisíveis.
- **~1100px:** o mesmo (não usa cards Tailwind). Headers fantasma + barra azul.
- **Parecer:** P0. Não usar `colorBackgroundTable` no tema claro.

### 4.14 Campanhas de fluxo — `/phrase-lists`

- **Claro:** só headers cinza e vazio (print do usuário).
- **Escuro:** título “Campanhas” azul-escuro no cinza (ilegível); área preta sem mensagem; “+ Campanha” solto.
- **~1100px:** headers “Nome / Status / Ações” quase invisíveis no branco; vazio sem mensagem. Igual ao desktop.
- **Parecer:** P0 nos dois temas.

### 4.15 API — `/messages-api`

- **Claro:** alerta laranja grande; bloco de código **preto** (aceitável para snippet); formulário de teste ok.
- **~1100px:** duas colunas ainda cabem; snippet escuro permanece intencional.
- **Parecer:** o card escuro aqui é intencional. Enxugar o alerta.

### 4.16 Usuários — `/users`

- **Claro:** tabela ok; 4 linhas visíveis de 8 (scroll); status “!” cinza ambíguo.
- **Escuro:** headers **invisíveis** (P0-6); botões editar/apagar brancos.
- **~1100px:** 8 cards carvão; nomes `font-semibold` pretos no fundo escuro (P0-10); coluna única `max-w-[375px]` com muito branco nas laterais.
- **Parecer:** corrigir `tableHead` resolve o desktop; o zoom de cards precisa da onda A + P0-10.

### 4.17 Filas — `/queues`

- **Claro:** 3 filas, tabela padrão, saudação visível.
- **~1100px:** 3 cards carvão; nomes “Suporte / Vendas / Financeiro” pretos no carvão (P0-10).
- **Parecer:** ok no claro desktop. Dark = P0-6. Cards = P0-1 + P0-10.

### 4.18 Talk.Ai — `/prompts`

- **Claro:** empty “Nenhum prompt encontrado.” + botão extra “MELHORIAS”.
- **~1100px:** empty em card carvão (P0-1).
- **Parecer:** igual Campanhas/Arquivos.

### 4.19 Integrações — `/queue-integration`

- **Claro:** empty “Nenhuma integração encontrada.”
- **~1100px:** empty em card carvão (P0-1).
- **Parecer:** ok mínimo no desktop.

### 4.20 Conexões — `/connections`

- **Claro desktop:** tabela (não o card). CTAs em duas linhas. WhatsApp conectado (número visível).
- **Claro ~1100px (browser):** card Tailwind `rgb(31, 41, 55)`; título preto `rgba(0,0,0,0.87)` (P0-10); DESCONECTAR `rgb(156, 39, 176)` (P0-2); CTAs em 2 linhas (P1-8).
- **Escuro ~1100px:** AppBar **clara** + miolo preto (P0-7, body ainda `rgb(255,255,255)`); título da página azul no preto; mesmo card carvão e Desconectar ilegível.
- **Escuro desktop:** tabela com headers invisíveis (P0-6); editar/apagar brancos.
- **Parecer:** a tela mais crítica do tema. Onda A + P0-6 + P0-10 juntos.

### 4.21 Lista de arquivos — `/files`

- **Claro:** empty textual + paginação “0 arquivos”.
- **~1100px:** empty em card carvão + paginação Tailwind escura (P0-1).
- **Parecer:** esconder paginação quando count=0.

### 4.22 Financeiro — `/financeiro`

- **Claro:** “Faturas (0)” + “Nenhuma fatura encontrada.”; tabela não usa a largura toda.
- **~1100px:** **permanece tabela** (não entra na família Tailwind). Saudação corta.
- **Parecer:** empty existe. Para cliente demo, uma frase “faturas aparecem quando houver cobrança” ajudaria.

### 4.23 Configurações — `/settings`

- **Claro:** 16 selects em grade + 4 textareas; labels longos; campo “Dias de aviso…” quebra a grade.
- **~1100px:** ainda 3 colunas; mais labels truncados (“setor/atende…”, “vencimento de lic…”).
- **Parecer:** funcional, mas parece painel de debug. Agrupar (atendimento, WhatsApp, LGPD, mensagens).

### 4.24 Configurações IA — `/ai-settings`

- **Claro (print):** cards altos, barra salvar vazia.
- **Escuro:** cards mais coerentes com o fundo; ainda esparsos; badge “Inativo” + switch redundantes.
- **~1100px:** grade 2×2 mais densa (melhor que o desktop largo). Sem Tailwind `dark:bg-gray-800`.
- **Parecer:** P2 de densidade. Tema escuro desta tela está melhor que o das tabelas.

### 4.25 Relatórios — `/reports` (sem item de menu)

- **Claro:** filtros ok; busca duplicada; 12 colunas; empty textual.
- **~1100px:** empty em card carvão; **scroll horizontal nos filtros** (P1-15); “Digite para pesquisar o c…” truncado; APLICAR FILTRO apertado.
- **Parecer:** ou entra no menu ou some da navegação. Grid quebra neste zoom.

### 4.26 Landing — `/landing`

- Hero e prints ok; banner de cookies visível; a11y `Decline cookies` / `Accept cookies` em inglês; um plano se chama “Plano 1”.
- **Parecer:** fora do ciclo do painel, mas o banner e o nome do plano são ruído pré-produção.

### 4.27 Tour — `/tour`

- Slide 1 limpo, contraste bom, 1/5.
- **Parecer:** ok para vitrine. Não misturar com o tema do painel.

### 4.28 LGPD — `/lgpd`

- Texto genérico; contato “WhatsApp: canal em configuração”.
- **Parecer:** já há pendência jurídica documentada. Não publicar o placeholder.

### 4.29 Empresas — `/companies`

- Redirecionou para Dashboard (persona cliente).
- **Parecer:** correto. Não auditar AllConnections/Licenças nesta empresa.

### 4.30 Cadastro — `/signup`

- Com sessão aberta, redireciona para `/`. **Login visto após logout** (§4.32).

---

### 4.31 Passada neste zoom (~1100px) — incremental

Medido: `innerWidth=1100`, `matchMedia('(min-width: 1200px)').matches === false`, `preferredTheme=light` (amostra dark só em Conexões). O zoom da ferramenta **não foi alterado**.

**O que o zoom revelou (novo ou confirmado de verdade):**

1. **Família Tailwind de cards é real no browser.** Não era só print. Empty states também viram o card carvão (Campanhas, Arquivos, Prompts, Integrações, Relatórios) — o “nenhum item” fica pior que no desktop.
2. **P0-10:** título do card é texto MUI preto no fundo `gray-800`. Nomes de conexão, usuário e fila ilegíveis.
3. **Nem toda listagem &lt;1200 usa esse card.** Contatos: cards brancos (ok no claro). Financeiro, Tags, Funil: continuam tabela. Tickets, Dashboard, Chat, Ajuda, phrase-lists, Flowbuilder, Settings, Agendamentos, API: layout próprio.
4. **P1-15 / P1-16:** Relatórios (scroll horizontal nos filtros) e Kanban (colunas truncadas) quebram neste zoom mesmo sem Tailwind.
5. **Alguns grids melhoram:** Painel 2×2 e IA 2×2 mais densos que no desktop largo.
6. **Chrome:** saudação com `noWrap` corta em **todas** as telas (P2-1 deixou de ser teórico). Tooltip do globo continua cru.
7. **Tema escuro neste zoom:** o toggle MUI não “conserta” o card Tailwind; ainda piora o chrome (AppBar clara + miolo preto, P0-7).

**Cards `max-w-[375px] mx-auto`:** coluna estreita no centro com faixa branca nas laterais (Usuários, Filas, Conexões). Densidade ruim para um desktop só “um pouco” abaixo de 1200.

---

### 4.32 Percurso de tarefa (Admin) — incremental

Feito neste zoom (~1100px), tema claro. **Não foram confirmadas** ações destrutivas: nenhuma mensagem enviada no WhatsApp, desconexão/exclusão/transferência canceladas.

**Abrir ticket → responder**

- Abrir Mercado Central #15 (já atribuído ao Carlos) funciona: histórico, composer, fundo estilo WhatsApp.
- Duas bolhas “ola” iguais (03:19) — ruído de demo ou envio duplicado.
- Digitar `/` abre a lista de respostas rápidas **e** deixa o `/` no campo. Os itens aparecem como `//aguardar - texto - texto` (atalho + corpo **duas vezes**, P1-18).
- Placeholder do composer corta neste zoom. Ícones do composer (`emojiPicker`, `assistant`, `flash`) sem nome visível para quem só lê a tela.
- Tag **FECHADO GANHO** no card que está em **ATENDENDO** (P0-11). A lane Kanban e a aba de tickets não batem.

**Transferir**

- O ícone Transferir da **lista** abre o modal; o do header do chat não tinha `aria-label` útil (clique pelo SVG `Transferir Ticket`).
- Modal **Transferir Ticket**: buscar usuário, fila, observações internas (“não vai para o cliente”). **TRANSFERIR** fica desabilitado até escolher destino. **CANCELAR** outlined roxo. Overlay ok. Cancelado.

**Resolver**

- Ícone Resolver da lista **não abriu** um diálogo de confirmação visível nesta passada. Há um bloco “Etapa Kanban / Observação” no rodapé do chat — o encerramento parece misturado com o Kanban, não um “tem certeza?”. Encerrar **não** foi confirmado.

**Desconectar / reconectar WhatsApp**

- DESCONECTAR abre `ConfirmationModal`: *“Tem certeza? Você precisará ler o QR Code novamente.”* Texto bom.
- Botões: **CANCELAR** cinza e **Ok** roxo — a ação destrutiva chama-se Ok, não Desconectar (P1-17).
- Cancelado. Reconectar (QR) **não** foi exercitado de propósito, para não derrubar a sessão demo.

**Criar usuário**

- **Adicionar usuário** abre formulário longo (Geral / Permissões): avatar, nome, senha, e-mail, perfil **User** (inglês), filas, conexão, horário 00:00–23:59, despedida, tema, menu. Neste zoom, **Adicionar/Cancelar ficam abaixo da dobra** (P1-21). Fechado sem salvar. Criar fila não foi reaberto (mesmo padrão de modal das listagens).

**Apagar**

- Lixeira da conexão: *“Você tem certeza? Essa ação não pode ser revertida.”* Mesmo **Ok** roxo (P1-17). Cancelado. WhatsApp da demo permanece conectado.

**Login frio**

- Logout → `/login`: slogan ok, labels **Email/Password** em inglês (P1-22), “Lembrar de mim”, Entrar. Sem cadastro nesta tela.

---

### 4.33 Persona atendente (Beatriz) — incremental

Login: `atendente@taktchat.local`. Home efetiva: **`/tickets`**, não o Dashboard.

**Menu que ela vê:** Atendimentos, Respostas rápidas, Kanban, Funil (lanes), Contatos, Tags, Ajuda. Grupo **Administração** aparece **vazio** (P2-13). Não há Conexões, Usuários, Filas, Configurações, Financeiro, Campanhas, Flowbuilder, API, Dashboard, Painel, Chat interno, Agendamentos.

**O que isso muda nas ondas:** polir Settings, Conexões, Usuários, phrase-lists e IA **não** altera o dia a dia da operadora. O P0 dela é o ticket (chips, status, overlay `/`, confirmações).

**Atendimento**

- 2 tickets em ATENDENDO (Carla, Maria / Suporte). 0 em AGUARDANDO — João (Vendas) não aparece, correto pela fila.
- Chips ainda lotados; Carla/Maria com **AGUARDANDO CLIENTE** enquanto a aba é ATENDENDO (mesmo tipo de contradição do P0-11).
- Composer igual ao admin. **Espiar conversa** nas próprias conversas (P2-14).
- **Transferir abre o mesmo modal do admin** (P1-20), embora o kit documente que a Beatriz não tem `tickets.transfer`. Não confirmamos o POST.

**Contatos**

- **Contatos (2)** com tag `#Beatriz` (Carla e Maria). Empty rico do admin some; a regra da tag pessoal funciona. Banner “mantenha pressionado…”. Paginação com 2 itens.

**Rotas de admin**

- `/` (Dashboard) e `/connections`: tela **403 Oops! Acesso Negado! + VOLTAR**, chrome da atendente em volta (P1-19). O menu esconde o destino, mas a URL direta assusta. VOLTAR deve ir para `/tickets`, não para `/`.

**Chrome**

- Saudação “seja **bem-vindo**” no masculino (P2-12). Sem “Ativo até…” na barra (licença some para ela). Mesmo globo cru e tooltip Abertos.

Sessão restaurada para Carlos Admin ao final.

---

## 5. Problemas transversais (layout)

| Tema | Detalhe |
|------|---------|
| Duas fontes de dark | MUI `preferredTheme` vs Tailwind `prefers-color-scheme` |
| Título no card Tailwind | `font-semibold text-sm` herda `rgba(0,0,0,0.87)` — preto no `gray-800` |
| `tableHead` | `grey[100]` fixo + `text.secondary` → quebra o **tema escuro** em todas as tabelas HTML |
| Secondary MUI default | Roxo nos botões “secundários” (Desconectar, Chamar suporte) |
| Drawer | Só ícone; 20+ destinos |
| AppBar | `noWrap` + i18n cru no globo — **corta em 1100px em todas as telas** |
| Empty state | Contacts e o painel direito de Tickets são o modelo; Chat/Helps/phrase-lists não; empties Tailwind viram card carvão |
| Paginação | Aparece com 0 registros; botões Tailwind também escuros |
| ConfirmationModal | Mesmo **Ok** roxo para desconectar WhatsApp e apagar conexão |
| Permissão vs UI | Atendente vê Transferir; Dashboard 403 se cair em `/` |
| Status do ticket | Aba ATENDENDO + tag de lane “fechado” / “aguardando cliente” |

---

## 6. O que não entra como “fazer agora”

- Redesign da landing/tour (ciclo próprio). Recolorir o canvas do FlowBuilder (editor).
- Preview estilo WhatsApp e bloco de código da API (intencionais).
- Inventar cidade na coluna CIDADE/UF.
- Adotar TeleCX (`VITE_UI_THEME`) — o contexto do projeto diz que o frontend **não** usa.
- Novo percurso completo de telas, persona supervisor (Diego), viewport celular (~375px), toast/erro após mutar a demo.

---

## 7. Antes de implementar (decisões)

O inventário **já basta** para código. Não falta tela. Falta fechar o recorte do **primeiro PR** e quatro decisões de produto. Sem isso, a onda C vira retrabalho.

### 7.1 Primeiro PR = só a Onda A

Não abrir A+B+C+D juntos. A Onda A é mecânica e atinge ~18 arquivos com `dark:bg-gray-800` (Connections, Users, Campaigns, Files, Queues, QuickMessages, Prompts, Integrações, Relatórios, Companies, Announcements, ContactLists, AuditLogs, AllConnections, CardSkeleton…).

**Abordagem recomendada:** `darkMode: 'class'` no Tailwind **e** ligar/desligar a classe `dark` no `html` junto com o `preferredTheme` do MUI. Não “corrigir só Conexões”. Não apagar as classes `dark:*` sem essa ligação — o tema escuro piora.

**Pergunta:** o tema escuro entra na produção desta versão? Se **não**, a Onda A ainda vale (SO em dark + app em claro é o P0-1), mas a Onda B (headers de tabela no dark) pode esperar.

### 7.2 Quatro decisões de produto

| ID | Pergunta | Se não decidir |
|----|----------|----------------|
| P0-11 | Ticket **open** com lane **Fechado ganho**: é bug (seed/arraste) ou o card deve mostrar a lane mesmo assim? Doc do Kanban: encerrar *move* para a lane; arrastar no quadro troca a tag **sem** fechar o ticket. | “Corrigir o chip” quebra o funil ou esconde informação útil |
| P1-20 | Beatriz **vê** Transferir; o botão **não** consulta `hasPermission`. Kit: ela não tem `tickets.transfer`. Esconder o ícone, deixar e tratar 403 no POST, ou atualizar o kit? | Onda C implementa o lado errado |
| P1-19 | `/` da atendente renderiza `ForbiddenPage`. Login já manda para `/tickets`. VOLTAR do 403 deve ir para `/tickets`, ou `/` redireciona quem não tem `dashboard.view`? | Polir a tela 403 em vez da navegação |
| P1-17 | `ConfirmationModal` usa **uma** chave i18n (`confirmationModal.buttons.confirm` → **Ok**) para todas as confirmações. O ajuste certo é `confirmLabel` (Desconectar / Excluir / Confirmar), não renomear o Ok global para Desconectar. | Todas as confirmações do painel mudam de rótulo de uma vez, errado |

### 7.3 Opcional, 15 min — só se quiser fechar a Onda C com menos chute

- Clicar **Resolver** de novo e descrever o overlay (é o desfecho Kanban, não um “tem certeza?”). Sem mutar o ticket.
- Não precisa: outro logout da Beatriz, Diego, celular 375px, enviar WhatsApp para ver toast.

### 7.4 Fora do primeiro PR (mesmo que P0)

Helps (P0-9), Chat interno (P0-8), phrase-lists (P0-3), landing/tour/LGPD, drawer só ícone, EmptyState compartilhado para “todas as listas”.

---

## 8. Ondas sugeridas (ainda sem código)

### Onda A — Tema único (P0-1, P0-2, P0-7, P0-10)

Uma fonte de verdade MUI↔Tailwind. Garantir que AppBar/sidebar/body sigam o mesmo `mode`. Títulos do card com `text.primary` (não preto herdado). Desconectar com contraste no papel.

### Onda B — Tabelas no dark + legado (P0-4, P0-5, P0-6)

`tableHead` com `background.paper` / `action.hover` e `text.primary`. Tags: títulos de seção no dark. Flowbuilder/phrase-lists: abandonar `colorBackgroundTable` no light.

### Onda C — Telas vazias + overlays de tarefa (P0-3, P0-8, P0-9, P0-11, P1-10, P1-17–P1-20)

Empty com título + próximo passo em phrase-lists, Chat, Helps. Paginação zerada. **Nesta passada:** confirmação destrutiva com rótulo da ação (Desconectar / Excluir, não Ok); ticket sem tag de lane contradizendo a aba; overlay `/` sem texto duplicado; 403 da atendente voltando para `/tickets`; esconder Transferir se a permissão não existir.

### Onda D — Grids e chrome (P1–P2)

Headers e sort; Conexões sem wrap; Settings agrupado; i18n do idioma; densificar IA; suavizar help de Tags. Neste zoom: filtros de Relatórios sem scroll horizontal; Kanban sem coluna truncada; saudação da AppBar sem `noWrap` cego.

---

## 9. Critério de pronto

- Tema claro ⇒ superfícies claras (mesmo com SO em dark).
- Tema escuro ⇒ chrome + tabelas + cards escuros, **headers de coluna legíveis**.
- Lista vazia ⇒ mensagem + próximo passo.
- Nenhuma chave i18n crua no AppBar.
- Confirmar destrutivo ⇒ rótulo da ação + cancelar óbvio.
- Persona atendente ⇒ menu só do que ela usa; 403 não é a “home”.

## 10. Referências

- Tema: `frontend/src/App.js`, `frontend/src/layout/index.js`
- Tailwind: `frontend/tailwind.config.js`
- Conexões / `tableHead`: `frontend/src/pages/Connections/index.js`, `frontend/src/pages/Users/index.js`
- Tokens legado: `frontend/src/styles/styles.js`
- Phrase lists / Flowbuilder: `frontend/src/pages/CampaignsPhrase/index.js`, `frontend/src/pages/FlowBuilder/index.js`
- ConfirmationModal: `frontend/src/components/ConfirmationModal/index.js`
