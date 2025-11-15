# Guia: Build e Publicação dos Dockerfiles

Este documento descreve como gerar as imagens Docker do Taktchat (frontend e backend) e publicá-las no Docker Hub utilizando os artefatos existentes no repositório.

## Pré-requisitos

- Docker instalado e em funcionamento.
- Credenciais ativas no Docker Hub (`docker login`).
- Repositório atualizado (`git pull origin main`).

## Estrutura dos Dockerfiles

| Projeto   | Dockerfile                        | Contexto de build          |
|-----------|-----------------------------------|----------------------------|
| Frontend  | `frontend/Dockerfile`             | Diretório `frontend/`      |
| Backend   | `backend/Dockerfile`              | Diretório `backend/`       |

Cada Dockerfile já contém o fluxo de build específico (install + build + imagem final). Basta apontar para o Dockerfile correto durante o `docker build`.

## Comandos manuais

### Frontend
```bash
docker build \
  -f frontend/Dockerfile \
  --build-arg REACT_APP_BACKEND_URL=https://taktchat-api.alivesolucoes.com.br \
  --build-arg REACT_APP_SOCKET_URL=https://taktchat-api.alivesolucoes.com.br \
  --build-arg PUBLIC_URL=https://taktchat.alivesolucoes.com.br \
  -t zanonalivesolucoes/taktchat-frontend:latest \
  frontend
```

> **Observação**: os argumentos possuem default (ambiente local), mas em produção precisam ser definidos para refletir o domínio correto. Outros argumentos opcionais: `REACT_APP_PRIMARY_COLOR`, `REACT_APP_PRIMARY_DARK`, `REACT_APP_FRONTEND_VERSION`.

### Backend
```bash
docker build \
  -f backend/Dockerfile \
  -t zanonalivesolucoes/taktchat-backend:latest \
  backend
```

Substitua `latest` pela tag desejada (ex.: `v1.2.3`). Após o build, publique:

```bash
docker push zanonalivesolucoes/taktchat-frontend:<tag>
docker push zanonalivesolucoes/taktchat-backend:<tag>
```

## Script automatizado

O repositório inclui `scripts/update-docker-images.sh`, que executa os dois builds e pushes na sequência.

Uso:
```bash
scripts/update-docker-images.sh [tag]
```

- `tag` é opcional (default `latest`).
- Você pode sobrescrever variáveis via ambiente:
  - `DOCKER_USER`
  - `FRONT_IMAGE`
  - `BACK_IMAGE`

Exemplo com tag customizada:
```bash
IMAGE_TAG=v2 scripts/update-docker-images.sh v2
```

## Boas práticas

- Antes de publicar, garanta que a `main` está atualizada.
- Use tags sem espaços e padronize (ex.: `yyyy.mm.dd`, `vX.Y.Z`).
- Após o push, considere testar o `docker pull` para validar se a imagem está acessível.

