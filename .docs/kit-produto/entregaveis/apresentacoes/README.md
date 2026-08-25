# Apresentações (decks)

Fonte em Markdown (reunião / PDF). No hub `/apresentacoes` o cartão mostra **para quem** e **em que momento usar**.

| Arquivo | No hub | Quando usar |
|---------|--------|-------------|
| [comercial-cliente-padrao.md](comercial-cliente-padrao.md) | Empresa cliente · Primeira reunião comercial | Pitch 12–15 min (contato → ticket) |
| [comercial-cliente-longa.md](comercial-cliente-longa.md) | Empresa cliente · Proposta e onboarding | Já há interesse / piloto |
| [comercial-parceiro-padrao.md](comercial-parceiro-padrao.md) | Revenda · Primeira reunião de parceria | Pitch whitelabel 10–12 min |
| [comercial-parceiro-longa.md](comercial-parceiro-longa.md) | Revenda · Contrato e operação da revenda | Fechar parceria e primeira filha |
| [tecnica-padrao.md](tecnica-padrao.md) | Dev/infra · Visão técnica rápida | Stack e tenancy, 12–15 min |
| [tecnica-longa.md](tecnica-longa.md) | Dev/infra · Deep dive técnico | Código, permissões, schema |

## Player no produto

Com o frontend em `:3000`:

- Hub: http://localhost:3000/apresentacoes
- Deck: http://localhost:3000/apresentacoes/`<id>`

IDs (URL, não mudam): `comercial-cliente-padrao`, `comercial-cliente-longa`, `comercial-parceiro-padrao`, `comercial-parceiro-longa`, `tecnica-padrao`, `tecnica-longa`.

Rota **privada**: precisa de login. Vê o player quem é `super`, admin da empresa plataforma, ou (nessa empresa) tem `apresentacoes.view`. Admin de empresa cliente/parceiro **não** vê. Setas do teclado avançam. Cada slide tem um parágrafo **Para falar** + bullets.

PNG canônicos: `backend/private/kit-apresentacoes/` (API autenticada). O que ainda não existe aparece como caixa “Print a gravar”. Lista: `backend/private/kit-apresentacoes/README.md`.
