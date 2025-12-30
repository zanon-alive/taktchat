# Etapa de build
# Usando node:20 (Debian) ao invés de Alpine para builds mais rápidos,
# especialmente em cross-compilation (AMD64 -> ARM64)
FROM node:20 AS build
WORKDIR /app

# Copia o package.json e instala as dependências
# Usando cache do BuildKit para acelerar builds subsequentes
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

# Copia o restante dos arquivos
COPY . .

# Argumentos configuráveis no build (com defaults seguros para desenvolvimento)
ARG REACT_APP_BACKEND_URL=http://localhost:8080
ARG REACT_APP_SOCKET_URL=http://localhost:8080
ARG REACT_APP_PRIMARY_COLOR=#2563EB
ARG REACT_APP_PRIMARY_DARK=#1E3A8A
ARG PUBLIC_URL=http://localhost:3000
ARG REACT_APP_FRONTEND_VERSION=dev

# Exporta para o ambiente de build (CRA lê REACT_APP_*)
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}
ENV REACT_APP_PRIMARY_COLOR=${REACT_APP_PRIMARY_COLOR}
ENV REACT_APP_PRIMARY_DARK=${REACT_APP_PRIMARY_DARK}
ENV PUBLIC_URL=${PUBLIC_URL}
ENV REACT_APP_FRONTEND_VERSION=${REACT_APP_FRONTEND_VERSION}

# Build da aplicação React
# Otimizações para cross-compilation (ARM64 emulação):
# - GENERATE_SOURCEMAP=false: desabilita source maps (reduz tempo significativamente)
# - CI=true: desabilita verificações desnecessárias
# - NODE_OPTIONS: aumenta memória disponível (alinhado com package.json)
# - SKIP_PREFLIGHT_CHECK: pula verificações pré-build
ENV GENERATE_SOURCEMAP=false
ENV CI=true
ENV SKIP_PREFLIGHT_CHECK=true
RUN NODE_OPTIONS=--max-old-space-size=8192 npm run build

# Etapa de deploy
FROM nginx:alpine

# Copia o build pronto para a pasta pública do nginx
COPY --from=build /app/build /usr/share/nginx/html

# nginx.conf simples (veja abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
