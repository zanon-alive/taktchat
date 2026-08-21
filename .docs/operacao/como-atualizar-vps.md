# Como atualizar o TaktChat na VPS

Cópia versionada de `stacks_producao-main-server/14_taktchat_como_atualizar.md` (2026-08-21).  
A stack em uso é **`14_taktchat.yml`** (volumes). Healthcheck: `https://api.taktchat.com.br/health`.

## 14_taktchat - Como atualizar em produção

Este documento resume o passo a passo para atualizar o TaktChat no servidor, depois que você fizer alterações na sua máquina local, abrir PR e fizer o merge no GitHub.

Existem **dois tipos de atualização**:
- **A) Atualizar apenas o código do TaktChat** (backend/frontend)
- **B) Atualizar a infraestrutura (infra)** – stacks, Dockerfiles, scripts, etc.

---

## A) Quando você mudar **apenas o código** do TaktChat

Exemplos:
- Alterou arquivos em `backend/` ou `frontend/` do repositório `taktchat`
- Corrigiu bugs, adicionou endpoints, ajustou telas, etc.

### 1. Garantir que o código foi mergeado

1. Abrir PR no GitHub do repositório `zanon-alive/taktchat`
2. Fazer o **merge na branch `main`**

### 2. Atualizar código no servidor

No servidor VPS:

```bash
cd /root/taktchat
git pull origin main
```

### 3. Atualizar dependências e build (opção recomendada)

Usar o script já preparado nas stacks:

```bash
cd /root/stacks
./update-taktchat.sh
```

O que esse script faz (resumo):
- Dá `git pull` em `/root/taktchat`
- Verifica se `package.json` mudou e instala dependências se necessário
- Verifica/compila TypeScript
- Roda migrations do banco
- Pergunta se deseja reiniciar os serviços

### 4. Reiniciar serviços manualmente (caso não use o script)

Se quiser apenas forçar o backend (e/ou frontend) sem rodar o script:

```bash
# Backend
docker service update --force taktchat_taktchat-backend

# Frontend (se houve mudança no frontend)
docker service update --force taktchat_taktchat-frontend
```

### 5. Conferir se está tudo OK

```bash
# Ver serviços da stack TaktChat
docker service ls | grep taktchat

# Logs do backend
docker service logs --tail 80 taktchat_taktchat-backend

# Healthcheck da API
curl -k https://api.taktchat.com.br/health
```

Se o `/health` responder com `{"status":"ok", ...}`, o backend está saudável.

---

## B) Quando você mudar **infra** (stacks, Dockerfile, scripts)

Aqui entram mudanças no repositório **`stacks_producao-main-server`**, por exemplo:

- Arquivo `14_taktchat.yml`
- `Dockerfile.taktchat-backend`
- Scripts em `scripts/` (`taktchat-backend-startup.sh`, `taktchat-migrate-startup.sh`, etc.)
- Outros arquivos `.yml` de stacks

### 1. Garantir que o PR foi mergeado

1. Abrir PR no GitHub do repositório `zanon-alive/stacks_producao-main-server`
2. Fazer o **merge na branch `master`**

### 2. Atualizar stacks no servidor

No servidor:

```bash
cd /root/stacks
git pull origin master
```

### 3. Quando houver mudança no Dockerfile do backend

Se você alterou **`Dockerfile.taktchat-backend`** ou algo que exige rebuild da imagem:

```bash
cd /root/stacks
docker build -f Dockerfile.taktchat-backend -t taktchat-backend:latest .
```

Conferir se a imagem existe:

```bash
docker images | grep taktchat-backend
```

### 4. Reaplicar a stack TaktChat

Depois de atualizar o repositório e (se necessário) rebuildar a imagem:

```bash
cd /root/stacks
docker stack deploy -c 14_taktchat.yml taktchat
```

Isso atualiza:
- `taktchat_taktchat-backend`
- `taktchat_taktchat-frontend`
- `taktchat_taktchat-migrate`

### 5. Se o serviço ficar em estado *Rejected* (imagem não encontrada)

Se aparecer algo como:

```bash
docker service ps taktchat_taktchat-backend
# CURRENT STATE: Rejected - No such image: taktchat-backend:latest
```

Execute:

```bash
cd /root/stacks

# Garantir que a imagem existe
docker images | grep taktchat-backend

# Forçar atualização do serviço para usar a imagem local
docker service update --force --image taktchat-backend:latest taktchat_taktchat-backend
```

Conferir novamente:

```bash
docker service ps taktchat_taktchat-backend
docker service logs --tail 80 taktchat_taktchat-backend
```

Se ainda tiver problema, como último recurso:

```bash
docker stack rm taktchat
sleep 10
docker stack deploy -c 14_taktchat.yml taktchat
```

---

## Resumo rápido (cola no terminal quando for atualizar)

### Quando mudar **só o código** (repositório `taktchat`)

```bash
# 1. Atualizar código
cd /root/taktchat
git pull origin main

# 2. Atualizar dependências + migrations (recomendado)
cd /root/stacks
./update-taktchat.sh

# 3. Reiniciar serviços (se precisar manual)
docker service update --force taktchat_taktchat-backend
docker service update --force taktchat_taktchat-frontend
```

### Quando mudar **infra** (repositório `stacks_producao-main-server`)

```bash
# 1. Atualizar stacks
cd /root/stacks
git pull origin master

# 2. Se Dockerfile.taktchat-backend mudou:
docker build -f Dockerfile.taktchat-backend -t taktchat-backend:latest .

# 3. Reaplicar a stack TaktChat
docker stack deploy -c 14_taktchat.yml taktchat

# 4. Conferir
docker service ls | grep taktchat
docker service ps taktchat_taktchat-backend
docker service logs --tail 80 taktchat_taktchat-backend
```

Use este arquivo sempre que precisar lembrar **como atualizar o TaktChat no servidor** depois de mexer no código ou na infra.

