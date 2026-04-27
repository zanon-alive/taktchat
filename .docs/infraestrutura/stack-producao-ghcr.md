## Stack de Produção (GHCR + tag por SHA)

Este guia descreve o deploy recomendado para produção estável: **imagens Docker publicadas no GHCR** (GitHub Container Registry), com **tags imutáveis por SHA**, e update via Portainer/Swarm por pull + redeploy.

### Arquivo de stack

- `14_taktchat_ghcr.yml`

### Serviços

- **`taktchat-backend` (lean, sem Chromium)**:
  - Exposto no Traefik (`api.taktchat.com.br`)
  - Monta volumes:
    - `taktchat_media:/app/public`
    - `taktchat_private:/app/private`
  - Faz proxy interno para label sync quando `LABEL_SYNC_INTERNAL_URL` está configurada.

- **`taktchat-label-sync` (browser, com Chromium)**:
  - **Não exposto no Traefik** (somente `app_network`)
  - Monta os mesmos volumes (`/app/private` é obrigatório)
  - Sobe o servidor interno: `node dist/internal/label-sync-server.js`
  - Protegido pelo header `X-Internal-Token` (configurado via `LABEL_SYNC_INTERNAL_TOKEN`)

- **`taktchat-frontend`**:
  - Exposto no Traefik (`taktchat.com.br`)
  - Buildado no CI e servido via Nginx (imagem pronta).

- **`taktchat-migrate`**:
  - Executa `npx sequelize db:migrate` (uma vez) usando a imagem lean.

### Variáveis recomendadas no Portainer

- `TAKTCHAT_OWNER`: `zanon-alive`
- `TAKTCHAT_IMAGE_TAG`: `<sha do commit>` (recomendado) ou `latest`
- `LABEL_SYNC_INTERNAL_TOKEN`: token forte (mesmo valor em `taktchat-backend` e `taktchat-label-sync`)

### Update (resumo)

1. Merge na `main`
2. Aguardar workflows publicarem imagens no GHCR (tag por SHA)
3. No Portainer: atualizar `TAKTCHAT_IMAGE_TAG` e fazer **Update the stack**

