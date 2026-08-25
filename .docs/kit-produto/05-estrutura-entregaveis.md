# Estrutura dos entregáveis finais

Criar a partir da Fase 3 (rascunho do catálogo pode começar no fim da Fase 1). Screenshots podem ir para a pasta já na Fase 1.

## Árvore alvo

```
.docs/kit-produto/entregaveis/
  catalogo/
    README.md                         # índice + o que o produto não faz (resumo)
    01-atendimento-tickets.md         # o mais longo — ver 10-fluxo-do-ticket.md
    02-contatos-tags-kanban.md
    03-conexoes-whatsapp.md
    04-filas-bots.md
    05-campanhas.md
    06-flow-builder.md
    07-ia.md
    08-landing-widget-canais.md
    09-chat-interno-agendamentos.md
    10-usuarios-permissoes-settings.md
    11-whitelabel-licencas.md
    12-financeiro-dashboards.md
    13-api-integracoes.md
  manuais/
    dono-plataforma.md
    parceiro-whitelabel.md
    admin-empresa.md
    atendente.md                      # ticket em destaque, receitas
    supervisor-operacional.md         # se Fase 2 confirmar utilidade
  apresentacoes/
    comercial-cliente-padrao.md       # ~10–12 slides
    comercial-cliente-longa.md        # até ~20
    comercial-parceiro-padrao.md
    comercial-parceiro-longa.md
    tecnica-padrao.md                 # ~12–15
    tecnica-longa.md                  # até ~20 + LGPD/tenant
  extras/
    matriz-permissoes.md
    roteiro-demo.md
    glossario.md                      # cópia final de 12-glossario.md
    onboarding-15min.md
    baileys-vs-oficial.md
    fluxo-do-ticket.md                # versão publicada de 10-fluxo-do-ticket.md
    screenshots/
      README.md
```

## Catálogo — bloco por módulo

```markdown
## Nome

- Para que serve
- Onde fica (menu + URL)
- Quem usa
- O que a pessoa faz
- Dependências
- O que isto não é / limites
- Status na navegação: exercitado | só UI | bloqueado
- Screenshots
```

Módulo **01-atendimento-tickets.md** obrigatoriamente inclui: nascimento (entrada e saída), estados, aceite, resposta, transferência, tags, encerramento, o que acontece se o cliente falar de novo.

## Manuais — receita

Além da estrutura já definida (este manual é para você / o que não fazer / primeiro acesso):

```markdown
### Como [tarefa]

1. ...
2. ...
3. Resultado esperado: ...
Screenshot: ...
```

Receitas mínimas do atendente: aceitar, responder, resposta rápida, transferir, tag, encerrar, achar conversa encerrada.

## Apresentações

Cada arquivo: `## Slide N — título` + 3–5 bullets.

Comercial **cliente**: dor do atendimento, omnichannel, ticket no centro, campanhas, dual channel, IA, como começa, CTA.

Comercial **parceiro**: revenda, hierarquia, licenças, cobrança, o que o parceiro não precisa operar no ticket do cliente final, CTA.

Técnica **longa**: incluir isolamento multi-tenant, JWT/permissões, LGPD, volumes de sessão WhatsApp.

## Screenshots

Pasta `extras/screenshots/` (atalhos para os PNG em `backend/private/kit-apresentacoes/`). Nome:

`f1-<persona>-<tela-curta>.png`  
Ex.: `f1-atendente-ticket-maria.png`

Legenda na ficha e no catálogo. Sem dado pessoal real (o seed já é fictício).
