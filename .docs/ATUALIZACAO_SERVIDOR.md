# Guia Completo: Atualização do TaktChat no Servidor

## Data: 2026-01-18

## Visão Geral

Este documento descreve o processo para atualizar o TaktChat no servidor de produção após o código ter sido commitado, enviado ao repositório e feito merge na branch `main`. 

A stack utilizada em produção usa **volumes montados** para permitir atualizações rápidas sem necessidade de rebuild das imagens Docker. O código é montado diretamente do repositório clonado no servidor, permitindo atualizações em segundos com apenas `git pull` + restart dos serviços.

> **Nota:** Este guia é específico para a stack com volumes montados. Se você estiver usando a stack com build de imagens Docker, consulte a seção "Método Alternativo: Atualização com Build de Imagens" ao final deste documento.

O processo inclui:

1. Atualização do código no servidor
2. Atualização do backend
3. Build e atualização do frontend
4. Verificação e monitoramento dos serviços

---

## 📋 Pré-requisitos

- Acesso SSH ao servidor de produção
- Código já commitado e mergeado na branch `main` do repositório `zanon-alive/taktchat`
- Node.js e npm instalados no servidor (para build do frontend, se necessário)
- Repositório clonado em `/root/taktchat`
- Stack Docker Swarm configurada e rodando

---

## 🔄 Fluxo de Atualização no Servidor

### **ETAPA 1: Atualização no Servidor**

#### 1.1. Conectar ao servidor

```bash
ssh root@seu-servidor
```

#### 1.2. Atualizar o código do repositório

```bash
cd /root/taktchat
git pull origin main
```

**Verificar se atualizou:**
```bash
git log --oneline -5  # Ver últimos 5 commits
```

#### 1.3. Verificar se há mudanças em dependências

```bash
# Verificar se package.json mudou
cd /root/taktchat/backend
git diff HEAD@{1} HEAD --name-only | grep package.json
```

Se `package.json` ou `package-lock.json` foram modificados, será necessário reinstalar dependências.

---

### **ETAPA 2: Atualizar Backend**

#### 2.1. Usar script automatizado (Recomendado)

```bash
cd /root/stacks
./update-taktchat.sh
```

Este script faz automaticamente:
- ✅ Git pull do repositório
- ✅ Verifica mudanças em `package.json`
- ✅ Instala dependências se necessário
- ✅ Compila TypeScript
- ✅ Executa migrations do banco de dados
- ✅ Pergunta se deseja reiniciar os serviços

#### 2.2. Atualização manual (Alternativa)

Se preferir fazer manualmente:

```bash
# 1. Atualizar código
cd /root/taktchat
git pull origin main

# 2. Instalar dependências do backend (se necessário)
cd /root/taktchat/backend
npm install --legacy-peer-deps

# 3. Compilar TypeScript (se necessário)
npm run build

# 4. Reiniciar serviço do backend
cd /root/stacks
docker service update --force taktchat_taktchat-backend
```

---

### **ETAPA 3: Atualizar Frontend**

#### 3.1. Verificar se houve mudanças no frontend

```bash
cd /root/taktchat
git diff HEAD@{1} HEAD --name-only | grep frontend
```

#### 3.2. Opção A: Build Fora do Container (Recomendado)

O build do React dentro do container pode falhar por falta de memória. A solução recomendada é fazer o build fora do container.

**3.2.1. Build no servidor (fora do container):**

```bash
# 1. Navegar para o diretório do frontend
cd /root/taktchat/frontend

# 2. Reinstalar dependências incluindo devDependencies
npm install --legacy-peer-deps --include=dev

# 3. Definir variáveis de ambiente
export REACT_APP_BACKEND_URL=https://api.taktchat.com.br
export REACT_APP_SOCKET_URL=https://api.taktchat.com.br
export REACT_APP_PRIMARY_COLOR=#2563EB
export REACT_APP_PRIMARY_DARK=#1E3A8A
export PUBLIC_URL=https://taktchat.com.br
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true  # Desabilita ESLint durante o build
export NODE_OPTIONS=--max-old-space-size=4096

# 4. Fazer o build
npm run build

# 5. Verificar se o build foi criado
test -f build/index.html && echo "✅ Build completo" || echo "❌ Build incompleto"
test -d build/static && echo "✅ static/ existe" || echo "❌ static/ não existe"

# 6. Atualizar o serviço
cd /root/stacks
docker service update --force taktchat_taktchat-frontend
```

**3.2.2. Build na máquina local (alternativa):**

Se o servidor não tiver recursos suficientes, faça o build localmente:

```bash
# Na sua máquina local
cd ~/projetos/taktchat/frontend

# Instalar dependências (incluindo devDependencies)
# IMPORTANTE: @craco/craco está em devDependencies
npm install --legacy-peer-deps --include=dev

# Definir variáveis de ambiente
export REACT_APP_BACKEND_URL=https://api.taktchat.com.br
export REACT_APP_SOCKET_URL=https://api.taktchat.com.br
export REACT_APP_PRIMARY_COLOR=#2563EB
export REACT_APP_PRIMARY_DARK=#1E3A8A
export PUBLIC_URL=https://taktchat.com.br
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true  # Desabilita ESLint durante o build

# Fazer o build
npm run build

# Copiar build para o servidor
scp -r build/* root@seu-servidor:/root/taktchat/frontend/build/
```

#### 3.3. Opção B: Build Dentro do Container (Não Recomendado)

⚠️ **Atenção:** Esta opção pode falhar por falta de memória.

```bash
cd /root/stacks
docker service update --force taktchat_taktchat-frontend
```

O script `taktchat-frontend-startup.sh` tentará fazer o build automaticamente, mas pode falhar.

#### 3.4. Atualizar serviço do frontend

**Nota:** Se você seguiu o processo completo da ETAPA 3.2.1, o serviço já foi atualizado no passo 6. Se você fez o build dentro do container (ETAPA 3.3) ou na máquina local (ETAPA 3.2.2), atualize o serviço:

```bash
cd /root/stacks
docker service update --force taktchat_taktchat-frontend
```

---

### **ETAPA 4: Verificação e Monitoramento**

#### 4.1. Verificar status dos serviços

```bash
# Listar serviços do TaktChat
docker service ls | grep taktchat

# Verificar status detalhado
docker service ps taktchat_taktchat-backend
docker service ps taktchat_taktchat-frontend
docker service ps taktchat_taktchat-migrate
```

#### 4.2. Verificar logs

```bash
# Logs do backend
docker service logs --tail 100 taktchat_taktchat-backend

# Logs do frontend
docker service logs --tail 100 taktchat_taktchat-frontend

# Logs em tempo real
docker service logs -f taktchat_taktchat-backend
```

#### 4.3. Testar endpoints

```bash
# Healthcheck da API
curl -k https://api.taktchat.com.br/health

# Verificar resposta (deve retornar JSON com status: "ok")
```

#### 4.4. Verificar frontend no navegador

1. Acesse: `https://taktchat.com.br`
2. Verifique se a aplicação carrega corretamente
3. Teste funcionalidades principais

---

## 📝 Resumo Rápido (Comandos para Colar)

### Atualização Completa (Backend + Frontend)

```bash
# 1. Conectar ao servidor
ssh root@seu-servidor

# 2. Atualizar código
cd /root/taktchat
git pull origin main

# 3. Atualizar backend (script automatizado)
cd /root/stacks
./update-taktchat.sh

# 4. Build do frontend (fora do container)
cd /root/taktchat/frontend
npm install --legacy-peer-deps --include=dev
export REACT_APP_BACKEND_URL=https://api.taktchat.com.br
export REACT_APP_SOCKET_URL=https://api.taktchat.com.br
export REACT_APP_PRIMARY_COLOR=#2563EB
export REACT_APP_PRIMARY_DARK=#1E3A8A
export PUBLIC_URL=https://taktchat.com.br
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true  # Desabilita ESLint durante o build
export NODE_OPTIONS=--max-old-space-size=4096
npm run build

# 5. Verificar se o build foi criado
test -f build/index.html && echo "✅ Build completo" || echo "❌ Build incompleto"
test -d build/static && echo "✅ static/ existe" || echo "❌ static/ não existe"

# 6. Atualizar serviços
cd /root/stacks
docker service update --force taktchat_taktchat-frontend

# 7. Verificar
docker service ls | grep taktchat
docker service logs --tail 50 taktchat_taktchat-backend
curl -k https://api.taktchat.com.br/health
```

### Atualização Apenas Backend

```bash
cd /root/taktchat
git pull origin main
cd /root/stacks
./update-taktchat.sh
```

### Atualização Apenas Frontend

```bash
cd /root/taktchat
git pull origin main
cd /root/taktchat/frontend
npm install --legacy-peer-deps --include=dev
export REACT_APP_BACKEND_URL=https://api.taktchat.com.br
export REACT_APP_SOCKET_URL=https://api.taktchat.com.br
export REACT_APP_PRIMARY_COLOR=#2563EB
export REACT_APP_PRIMARY_DARK=#1E3A8A
export PUBLIC_URL=https://taktchat.com.br
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true  # Desabilita ESLint durante o build
export NODE_OPTIONS=--max-old-space-size=4096
npm run build
test -f build/index.html && echo "✅ Build completo" || echo "❌ Build incompleto"
test -d build/static && echo "✅ static/ existe" || echo "❌ static/ não existe"
cd /root/stacks
docker service update --force taktchat_taktchat-frontend
```

---

## ⚠️ Problemas Comuns e Soluções

### Problema 1: Build do frontend falha - "craco: not found"

**Sintoma:** Erro `sh: 1: craco: not found` ao executar `npm run build`

**Causa:** O `@craco/craco` está em `devDependencies` e não é instalado quando `NODE_ENV=production` sem o flag `--include=dev`

**Solução:**
```bash
cd /root/taktchat/frontend
# Reinstalar dependências incluindo devDependencies
npm install --legacy-peer-deps --include=dev
# Verificar se craco está disponível
which craco || node_modules/.bin/craco --version
# Tentar build novamente
npm run build
```

### Problema 2: Build do frontend falha dentro do container

**Sintoma:** Logs mostram "out of memory" ou "process exited too early"

**Solução:** Fazer build fora do container (ver ETAPA 3.2)

### Problema 3: Serviço não inicia após atualização

**Sintoma:** `docker service ps` mostra status "Rejected" ou "Failed"

**Solução:**
```bash
# Ver logs detalhados
docker service logs --tail 200 taktchat_taktchat-backend

# Verificar se dependências estão instaladas
docker exec $(docker ps -q -f name=taktchat-backend) ls -la /usr/src/app/node_modules

# Reinstalar dependências se necessário
cd /root/taktchat/backend
npm install --legacy-peer-deps
docker service update --force taktchat_taktchat-backend
```

### Problema 4: Migrations não executam

**Sintoma:** Mudanças no banco de dados não são aplicadas

**Solução:**
```bash
# Executar migrations manualmente
cd /root/stacks
docker service update --force taktchat_taktchat-migrate

# Ver logs da migration
docker service logs --tail 100 taktchat_taktchat-migrate
```

### Problema 5: Frontend não atualiza após build

**Sintoma:** Mudanças não aparecem no navegador

**Solução:**
```bash
# Verificar se build existe e está completo
ls -la /root/taktchat/frontend/build/
test -f /root/taktchat/frontend/build/index.html && echo "OK" || echo "FALTA"

# Limpar cache do navegador (Ctrl+Shift+R ou Ctrl+F5)
# Verificar se container está usando o build correto
docker exec $(docker ps -q -f name=taktchat-frontend) ls -la /usr/src/app/build/
```

---

## 🔍 Checklist de Atualização

Use este checklist para garantir que nada foi esquecido:

- [ ] Código atualizado no servidor (`git pull`)
- [ ] Dependências do backend atualizadas (se necessário)
- [ ] Build do frontend realizado (fora do container)
- [ ] Build verificado (index.html e static/ existem)
- [ ] Serviços Docker atualizados
- [ ] Logs verificados (sem erros)
- [ ] Healthcheck da API funcionando
- [ ] Frontend acessível no navegador
- [ ] Funcionalidades principais testadas

---

## 💡 Dicas Importantes

1. **Faça build do frontend fora do container** para evitar problemas de memória
2. **Verifique os logs após cada atualização**
3. **Mantenha backups antes de atualizações críticas**
4. **Comunique a equipe sobre atualizações em produção**
5. **Sempre verifique o healthcheck da API após atualizações**

---

## 📚 Documentação Relacionada

- **Build do Frontend Fora do Container:** `.docs/branchs/master/22_build_frontend_fora_container.md`
- **Como Atualizar TaktChat:** `14_taktchat_como_atualizar.md`
- **Script de Atualização:** `update-taktchat.sh`
- **Stack de Produção:** `.docs/infraestrutura/stack-producao.md` - Configuração completa da stack Docker Swarm
- **Scripts de Startup:** `.docs/SCRIPTS_STARTUP_EXEMPLO.md` - Exemplos de scripts de inicialização
- **Melhorias da Stack Rápida:** `.docs/MELHORIAS_FRONTEND_STACK_RAPIDA.md` - Detalhes das melhorias implementadas
- **Comparação de Stacks:** `.docs/COMPARACAO_STACKS.md` - Comparação entre stack com imagens e stack com volumes

---

## 🔄 Método Alternativo: Atualização com Build de Imagens Docker

Se você estiver usando uma stack que faz build de imagens Docker (não usa volumes montados), siga o processo abaixo:

### Processo com Build de Imagens

1. **Atualizar código:**
```bash
cd /root/taktchat
git pull origin main
```

2. **Build nativo das imagens Docker (ARM64):**
```bash
./scripts/build-docker-optimized.sh latest all
```

**Tempo estimado:** 8-15 minutos (build nativo é muito mais rápido que cross-compilation)

3. **Push para Docker Hub:**
```bash
docker push zanonalivesolucoes/taktchat-frontend:latest
docker push zanonalivesolucoes/taktchat-backend:latest
```

4. **Atualizar stack Docker Swarm:**
```bash
cd /root/stacks
docker stack deploy -c 14_taktchat.yml --with-registry-auth taktchat
```

5. **Verificar serviços:**
```bash
docker service ls | grep taktchat
docker service logs --tail 50 taktchat_taktchat-backend
```

> **Nota:** Para mais detalhes sobre o método com build de imagens, consulte `.docs/DOCKER_BUILD_E_DEPLOY.md`

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs dos serviços
2. Consulte a documentação relacionada
3. Verifique o status dos serviços Docker
4. Entre em contato com a equipe de infraestrutura

---

**Última atualização:** 2026-01-18
