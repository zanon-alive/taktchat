# Prints do player (`/apresentacoes`)

Pasta **privada**. O nginx/frontend **não** serve estes PNG.

O browser pede `GET /kit-apresentacoes/<arquivo>` no **backend**, com JWT. Sem login (ou sem permissão) a API responde 401/403.

Quem vê: `super`, admin da empresa `type = platform`, ou (somente na empresa plataforma) a permissão `apresentacoes.view`. Em empresa cliente/parceiro a permissão não vale e não aparece no catálogo.

No Docker o volume `backend-private` monta em `/app/private` (sessões WhatsApp). Os PNG do kit vão para `/app/kit-apresentacoes` na imagem, fora desse volume.

Quando um slide ainda não tem print, a apresentação mostra uma caixa amarela. Salve o PNG **nesta pasta do repositório**, com exatamente esse nome.

## Já existem

`f1-login.png` … `f26-supervisor-dashboard.png`, prints `pendente-*.png`. Celular: ilustração de IA (`pendente-whatsapp-celular.png`).

Atalhos dos `fNN` para o kit em Markdown: `.docs/kit-produto/entregaveis/extras/screenshots/`.
