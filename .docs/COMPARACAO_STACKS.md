# Comparação: Stack com Imagens Docker vs Stack com Volumes Montados

Este documento compara as duas abordagens de deploy do TaktChat no servidor.

## 📊 Comparação Geral

| Característica | Imagens Docker (`14_taktchat.yml`) | Volumes Montados (`14_taktchat_rapido.yml`) |
|----------------|-------------------------------------|----------------------------------------------|
| **Tempo de atualização** | 8-15 minutos (build necessário) | 10-30 segundos (apenas git pull) |
| **Isolamento** | ✅ Alto (tudo na imagem) | ⚠️ Médio (código no servidor) |
| **Portabilidade** | ✅ Alta (imagem portável) | ❌ Baixa (depende do servidor) |
| **Uso de memória** | Menor (código já compilado) | Maior (compila TypeScript) |
| **Complexidade** | Média (build + deploy) | Baixa (apenas git pull) |
| **Ideal para** | Produção estável | Desenvolvimento/atualizações frequentes |

---

## 🚀 Stack 1: Imagens Docker (`14_taktchat.yml`)

### Características

- ✅ **Backend**: Imagem Docker pré-construída (`zanonalivesolucoes/taktchat-backend:latest`)
- ✅ **Frontend**: Imagem Docker pré-construída (`zanonalivesolucoes/taktchat-frontend:latest`)
- ✅ **Migrate**: Usa imagem do backend

### Processo de Atualização

```bash
# 1. Git pull
cd /root/taktchat
git pull origin main

# 2. Build das imagens (8-15 minutos)
./scripts/build-docker-optimized.sh latest all

# 3. Push para Docker Hub
docker push zanonalivesolucoes/taktchat-frontend:latest
docker push zanonalivesolucoes/taktchat-backend:latest

# 4. Atualizar stack
docker stack deploy -c 14_taktchat.yml --with-registry-auth taktchat
```

**Tempo total:** 8-15 minutos

### Vantagens

- ✅ **Isolamento completo**: Tudo está na imagem Docker
- ✅ **Portabilidade**: Pode rodar em qualquer servidor Docker
- ✅ **Reproduzibilidade**: Sempre funciona da mesma forma
- ✅ **Menor uso de memória**: Código já está compilado
- ✅ **Melhor para produção**: Mais seguro e estável

### Desvantagens

- ❌ **Atualização lenta**: Precisa fazer build toda vez (8-15 min)
- ❌ **Processo mais complexo**: Build + push + deploy

---

## ⚡ Stack 2: Volumes Montados (`14_taktchat_rapido.yml`)

### Características

- ✅ **Backend**: `node:20-bookworm-slim` com código montado via volume
- ✅ **Frontend**: Imagem Docker pré-construída (React precisa ser buildado)
- ✅ **Migrate**: Usa `node:20-bookworm-slim` com volumes

### Processo de Atualização

```bash
# 1. Git pull
cd /root/taktchat
git pull origin main

# 2. Instalar novas dependências (se houver)
cd backend
npm install --legacy-peer-deps

# 3. Reiniciar serviço
docker service update --force taktchat_taktchat-backend
```

**Tempo total:** 10-30 segundos

### Vantagens

- ✅ **Atualização muito rápida**: Apenas git pull + restart (10-30 segundos)
- ✅ **Ideal para desenvolvimento**: Testa mudanças rapidamente
- ✅ **Processo simples**: Não precisa fazer build
- ✅ **Útil para hotfixes**: Correções rápidas em produção

### Desvantagens

- ❌ **Menos isolamento**: Código fica no servidor
- ❌ **Maior uso de memória**: Compila TypeScript em runtime
- ❌ **Depende do servidor**: Precisa ter node_modules instalado
- ❌ **Menos portável**: Depende da estrutura do servidor

---

## 🎯 Qual Escolher?

### Use **Imagens Docker** (`14_taktchat.yml`) quando:

- ✅ Produção estável
- ✅ Atualizações infrequentes
- ✅ Precisa de isolamento máximo
- ✅ Quer portabilidade (rodar em múltiplos servidores)
- ✅ Prefere menor uso de memória

### Use **Volumes Montados** (`14_taktchat_rapido.yml`) quando:

- ✅ Desenvolvimento/estágio
- ✅ Atualizações muito frequentes
- ✅ Quer testar mudanças rapidamente
- ✅ Precisa fazer hotfixes rápidos
- ✅ Tem apenas um servidor fixo

---

## 🔄 Migração Entre Stacks

### De Imagens Docker para Volumes Montados

```bash
# 1. Parar stack atual
docker stack rm taktchat

# 2. Clonar/atualizar repositório no servidor
cd /root
git clone https://github.com/zanon-alive/taktchat.git taktchat
# ou
cd /root/taktchat
git pull origin main

# 3. Instalar dependências
cd /root/taktchat/backend
npm install --legacy-peer-deps

# 4. Criar scripts de startup (se necessário)
# Ver scripts em /root/stacks/scripts/

# 5. Deploy nova stack
docker stack deploy -c 14_taktchat_rapido.yml --with-registry-auth taktchat
```

### De Volumes Montados para Imagens Docker

```bash
# 1. Parar stack atual
docker stack rm taktchat

# 2. Build das imagens
cd /root/taktchat
./scripts/build-docker-optimized.sh latest all

# 3. Push para Docker Hub
docker push zanonalivesolucoes/taktchat-frontend:latest
docker push zanonalivesolucoes/taktchat-backend:latest

# 4. Deploy nova stack
docker stack deploy -c 14_taktchat.yml --with-registry-auth taktchat
```

---

## 📝 Notas Importantes

### Stack com Volumes Montados

1. **Repositório no servidor**: O código deve estar clonado em `/root/taktchat` (ou ajuste o caminho)
2. **Dependências**: Precisa rodar `npm install` no servidor após git pull (se houver novas dependências)
3. **Scripts de startup**: Os scripts em `/root/stacks/scripts/` devem existir
4. **TypeScript**: Compila TypeScript em runtime (usa mais memória)

### Stack com Imagens Docker

1. **Docker Hub**: Precisa autenticação no Docker Hub
2. **Build**: Precisa fazer build antes de cada atualização
3. **Tempo**: Build leva 8-15 minutos (nativo ARM64)

---

## 🔗 Arquivos Relacionados

- Stack com imagens: `14_taktchat.yml`
- Stack com volumes: `14_taktchat_rapido.yml`
- Documentação de build: `.docs/DOCKER_BUILD_E_DEPLOY.md`
- Atualização no servidor: `.docs/ATUALIZACAO_SERVIDOR.md`
