# Plano de construção do kit

## Objetivo

Kit de produto validado na UI real, para operação, venda (cliente e parceiro) e entendimento técnico.

## Princípios

- Incremental: não apagar `.docs/` antigo; kit é camada nova.
- UI primeiro: catálogo descreve o que a pessoa vê e faz.
- Lacuna visível: o que não foi exercitado entra no diário e no catálogo como tal.
- Sem código de produto nesta branch.
- Se divergir da análise em `.docs/branchs/`, vale este kit.
- README da raiz pode estar defasado; correção na Fase 6, não agora.
- Ticket é a funcionalidade mais importante para cliente novo: profundidade extra em `10-fluxo-do-ticket.md` e no catálogo de atendimento.

## Fases (reajustadas)

### Fase 0 — Guias e dados locais (esta entrega)

Guias reescritos, melhorias aplicadas, logins e seed visual no banco **local**.

**Pronto quando:** este plano, logins em `09-logins-locais.md` e seed idempotente em `scripts/seed-local-kit.sql` existem.

### Fase 1 — Navegação, fichas, glossário e screenshots

Pode começar com **qualquer** login. Não espera a matriz completa.

1. Subir frontend/backend (Postgres e Redis já estão no ar neste ambiente).
2. Percorrer `03-checklist-navegacao.md` (coluna Status: `V` / `B` / `N`).
3. Uma ficha por tela visitada (`08-ficha-tela.template.md` → copiar para o diário ou pasta `fichas/`).
4. Screenshots em `entregaveis/extras/screenshots/` (padrão de nome no extra README).
5. Atualizar `12-glossario.md` com os termos vistos.
6. Registrar bugs e divergências só em `11-diario-navegacao.md`.
7. Jornadas obrigatórias: **ticket** (abrir, aceitar, responder, transferir, tag, encerrar — o que o ambiente permitir), settings/widget/landing, dual channel na UI de conexão.

**Pronto quando:** checklist sem item em branco; glossário v1; pelo menos as fichas das telas de ticket.

### Fase 2 — Matriz por persona

Entrar com cada login de `09-logins-locais.md` e preencher a matriz.

**Pronto quando:** as quatro personas obrigatórias têm coluna preenchida. Supervisor opcional. Persona cujo menu não bate com o esperado (ex.: parceiro sem `company.type`) fica marcada no diário, não inventada.

### Fase 3 — Catálogo

Escrever `entregaveis/catalogo/` (índice + um arquivo por módulo). Incluir “o que não faz”. O módulo de tickets é o mais longo.

Pode rascunhar o catálogo do que **já** foi visto na Fase 1, mesmo antes de terminar a Fase 2.

**Pronto quando:** cada item `V` do checklist tem seção; itens `B`/`N` listados.

### Fase 4 — Manuais

Receitas numeradas (“Como transferir um ticket”, passos 1–n). Ticket em destaque nos manuais de atendente, supervisor (se houver) e admin.

**Pronto quando:** dono, parceiro, admin empresa e atendente têm manual. Supervisor: manual próprio ou seção no admin.

### Fase 5 — Apresentações e extras

| Arquivo | Versões |
|---------|---------|
| Comercial cliente final | padrão + longa |
| Comercial parceiro | padrão + longa |
| Técnica | padrão + longa |
| Extras | matriz, demo, glossário final, onboarding 15 min, Baileys vs Oficial, fluxo do ticket (versão publicada) |

**Pronto quando:** os seis decks existem; extras listados existem; screenshots referenciados.

### Fase 6 — Fechamento

Revisar `README.md` da raiz e `.docs/README.md` com o que a navegação mostrou que estava incompleto. Resumo da branch. Confirmar com o usuário. Commit só se pedido.

## Ordem

```
0 → 1 → (2 e 3 podem se sobrepor) → 4 → 5 → 6
```

- Não escrever apresentação antes de existir catálogo mínimo do que foi visto.
- Não afirmar permissão de uma persona sem ter logado com ela (Fase 2) — usar “não testado” se faltar.

## Fora de escopo (salvo pedido novo)

- PDF/PPTX (Markdown primeiro; conversão depois se pedir)
- Vídeo
- Alterar telas do produto
- Reescrever `.docs/legacy/`
- Deploy
- Rodar as ~23 migrations pendentes do banco local (whitelabel `company.type`) — só com OK explícito; ver `07-lacunas-e-perguntas.md`

## Como retomar

Ler `.ai/NEXT_PROMPT.md` e este arquivo. Continuar na primeira fase incompleta.
