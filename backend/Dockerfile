FROM node:20-bullseye AS build
WORKDIR /app
ENV NODE_ENV=development
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

# Copia apenas manifestos para aproveitar cache
COPY package*.json ./

# Toolchain para dependências nativas (mysql2/pg/node-gyp, etc.)
# Usando cache do apt para acelerar builds subsequentes
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt-get update \
  && apt-get install -y --no-install-recommends \
       python3 python-is-python3 python3-dev python3-distutils \
       build-essential pkg-config libssl-dev git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Instala dependências baseadas no package-lock (mais reprodutível) com diagnóstico detalhado e fallback
# Usando cache do BuildKit para acelerar builds subsequentes
RUN --mount=type=cache,target=/root/.npm \
  set -eux; \
  node -v; npm -v; \
  npm config set fund false; \
  npm config set audit false; \
  npm config set fetch-retries 5; \
  npm config set fetch-timeout 120000; \
  npm ci --legacy-peer-deps --no-audit --no-fund --loglevel=verbose \
  || npm install --legacy-peer-deps --no-audit --no-fund --no-optional --loglevel=verbose \
  || { \
    echo 'npm install failed, dumping npm logs'; \
    ls -lah /root/.npm/_logs || true; \
    for f in /root/.npm/_logs/*; do echo "==== $f ===="; sed -n '1,200p' "$f" || true; echo '---- tail ----'; tail -n 200 "$f" || true; done; \
    exit 1; \
  }

# Copia o restante do código
COPY . .

# Garante diretório público mesmo que não exista no repo (evita falha no COPY do runtime)
RUN mkdir -p public

# Build info (gera arquivos .git-commit e .build-date no estágio de build)
ARG GIT_COMMIT
ARG BUILD_DATE
RUN set -eux; \
  COMMIT="${GIT_COMMIT:-}"; \
  if [ -z "$COMMIT" ] && [ -d .git ]; then COMMIT="$(git rev-parse --short HEAD)"; fi; \
  DATE="${BUILD_DATE:-}"; \
  if [ -z "$DATE" ]; then DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"; fi; \
  printf "%s" "$COMMIT" > .git-commit; \
  printf "%s" "$DATE" > .build-date

# Build Typescript -> dist
RUN npm run build

# Remover devDependencies e cache para reduzir imagem
RUN npm prune --omit=dev \
  && npm cache clean --force

# --- Runtime ---
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Dependências de runtime necessárias
# FFmpeg para processamento/conversão de mídia
# Chromium para Puppeteer
# Consolidado em um único RUN para reduzir layers e melhorar cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt-get update \
  && apt-get install -y --no-install-recommends \
       ffmpeg \
       chromium \
  && rm -rf /var/lib/apt/lists/*

# Build info injection
ARG BUILD_DATE
ARG GIT_COMMIT
ARG BACKEND_VERSION
ENV BUILD_DATE=$BUILD_DATE
ENV GIT_COMMIT=$GIT_COMMIT
ENV BACKEND_VERSION=$BACKEND_VERSION
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copia manifestos, dependências já instaladas e artefatos compilados
# Consolidado em grupos lógicos para otimizar layers
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/certs ./certs
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/.sequelizerc ./.sequelizerc
# Build info files (presentes em runtime para fallback)
COPY --from=build /app/.git-commit ./.git-commit
COPY --from=build /app/.build-date ./.build-date

# Cria diretório privado para sessões e arquivos temporários
RUN mkdir -p ./private

EXPOSE 8080

# Executa o servidor compilado (sem nodemon em produção)
CMD ["node", "dist/server.js"]
