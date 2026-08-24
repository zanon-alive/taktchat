# Imagens das apresentações (`/apresentacoes`)

**Pasta canônica dos PNG.** O browser pede `http://localhost:3000/kit-apresentacoes/<arquivo>`. O kit em `.docs/.../extras/screenshots/` só tem atalhos para estes arquivos — não copie o binário de novo.

Quando um slide ainda não tem print, a apresentação mostra uma **caixa amarela** com o nome do arquivo e o que gravar. Basta salvar o PNG **aqui**, com **exatamente** esse nome — o placeholder some sozinho.

## Já existem

`f1-login.png` … `f26-supervisor-dashboard.png` (e o `f1-atendente-tickets-lista.png` antigo).

Gravados em 2026-08-23/24: `pendente-whatsapp-connected.png`, `pendente-landing-hero.png`, `pendente-landing-planos.png`, `pendente-flow-builder.png`, `pendente-campanhas.png`, `pendente-ia-prompts.png`, `pendente-widget-chat-site.png`, `pendente-kanban.png`, `pendente-kanban-lane.png`, `pendente-health.png`, `pendente-partner-billing.png`, `pendente-planos-whitelabel.png`, `pendente-infra-docker.png`, `pendente-bull-redis.png`, `pendente-docs-kit.png`, `pendente-migrations.png`, `pendente-arquitetura.png`.

Captura real da UI em 2026-08-24: `pendente-signup-partner.png` (`?partner=4`), `pendente-signup-token.png` (token na URL, plano Revenda Starter Kit aberto).

## Ilustração de IA (não é print do aparelho)

| Arquivo | O que é | Limitação |
|---------|---------|-----------|
| `pendente-whatsapp-celular.png` | Lista de conversas no celular (pessoal + clientes) — o “antes”. | Ilustração genérica; sem logo oficial WhatsApp; não é o aparelho da demo. |

O cadastro da filha **já é print real**. Sem sessão, `/signup-partner` só funciona depois do ajuste em `Route.js` (rotas privadas não podem redirecionar ao login se o path não bate). Token hex que **começa com dígito** ainda é tratado como id no backend (`parseInt`) — no kit local o token do Parceiro Demo Kit foi prefixado com letra para a URL `?token=` abrir.

Depois de gravar um `fNN-….png` do kit, crie o atalho em `.docs/kit-produto/entregaveis/extras/screenshots/` com o mesmo nome (aponta para este arquivo). `pendente-*.png` pode ficar só aqui até virar print permanente.
