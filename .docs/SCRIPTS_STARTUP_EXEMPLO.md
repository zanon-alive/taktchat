# Scripts de startup — referência histórica

> **Histórico, não fonte de instalação.** Estes exemplos foram produzidos para variantes antigas com bind mounts. Produção usa imagens GHCR fixadas por digest e não monta estes scripts.
>
> Não copie estes blocos para a VPS. A definição ativa está no Portainer; `14_taktchat.yml` local não foi confirmado em produção. Para release, use `.docs/operacao/release-deploy-rollback-swarm.md`.

Os exemplos ajudam a entender o contrato antigo dos scripts. Containers usam Node.js 20; Node.js 22 pode ser usado no desenvolvimento local.

## 📋 Pré-requisito

Referência de diretório usada pela stack:

```bash
mkdir -p /root/stacks/scripts
chmod +x /root/stacks/scripts/*.sh
```

---

## 🔧 Script: `taktchat-backend-startup.sh`

**Caminho no servidor**: `/root/stacks/scripts/taktchat-backend-startup.sh`

```bash
#!/bin/sh
set -e

echo "=========================================="
echo "TaktChat Backend - Iniciando..."
echo "=========================================="

# Verificar se node_modules existe, se não, instalar
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install --legacy-peer-deps
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Verificar se a compilação foi bem-sucedida
if [ ! -d "dist" ]; then
    echo "❌ Erro: Diretório 'dist' não foi criado após compilação"
    exit 1
fi

# Iniciar servidor
echo "🚀 Iniciando servidor backend..."
exec node dist/server.js
```

---

## 🎨 Script: `taktchat-frontend-startup.sh`

**Caminho no servidor**: `/root/stacks/scripts/taktchat-frontend-startup.sh`

```bash
#!/bin/sh
set -e

echo "=========================================="
echo "TaktChat Frontend - Iniciando..."
echo "=========================================="

# Verificar se node_modules existe, se não, instalar
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install --legacy-peer-deps
fi

# Verificar se build existe e é recente (últimas 5 minutos)
# Se não existir ou for muito antigo, fazer rebuild
BUILD_NEEDED=true
if [ -d "build" ] && [ -f "build/index.html" ]; then
    BUILD_AGE=$(find build/index.html -mmin +5 2>/dev/null || echo "0")
    if [ "$BUILD_AGE" = "0" ]; then
        BUILD_NEEDED=false
        echo "✅ Build existente e recente, pulando rebuild..."
    fi
fi

if [ "$BUILD_NEEDED" = "true" ]; then
    echo "🔨 Compilando React (isso pode levar alguns minutos)..."
    npm run build
    
    # Verificar se o build foi bem-sucedido
    if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
        echo "❌ Erro: Build não foi criado corretamente"
        exit 1
    fi
    echo "✅ Build concluído com sucesso!"
fi

# Iniciar servidor Express para servir arquivos estáticos
echo "🚀 Iniciando servidor frontend na porta 80..."
exec node server.js
```

**Configuração atual:** o frontend deve atender internamente na porta `80`, conforme o label do Traefik na stack canônica. O build recomendado é executado no host antes da atualização do serviço.

```javascript
// frontend/server.js
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Frontend servindo na porta ${PORT}`);
});
```

---

## 🗄️ Script: `taktchat-migrate-startup.sh`

**Caminho no servidor**: `/root/stacks/scripts/taktchat-migrate-startup.sh`

```bash
#!/bin/sh
set -e

echo "=========================================="
echo "TaktChat Migrations - Executando..."
echo "=========================================="

# Verificar se node_modules existe, se não, instalar
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install --legacy-peer-deps
fi

# Compilar TypeScript (necessário para migrations)
echo "🔨 Compilando TypeScript..."
npm run build

# Executar migrations
echo "🗄️ Executando migrations do banco de dados..."
npx sequelize db:migrate

# Seeds não fazem parte do release normal de produção.

echo "✅ Migrations concluídas com sucesso!"
```

---

## Como os scripts eram criados

> As seções abaixo são históricas. Na VPS atual, altere scripts somente por mudança revisada no repositório de infraestrutura; não crie ou substitua arquivos manualmente a partir desta página.

### Método 1: Via SSH (Manual)

```bash
# Conectar ao servidor
ssh root@seu-servidor.com

# Criar diretório
mkdir -p /root/stacks/scripts

# Criar script backend
cat > /root/stacks/scripts/taktchat-backend-startup.sh << 'EOF'
#!/bin/sh
set -e
echo "=========================================="
echo "TaktChat Backend - Iniciando..."
echo "=========================================="
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install --legacy-peer-deps
fi
echo "🔨 Compilando TypeScript..."
npm run build
if [ ! -d "dist" ]; then
    echo "❌ Erro: Diretório 'dist' não foi criado após compilação"
    exit 1
fi
echo "🚀 Iniciando servidor backend..."
exec node dist/server.js
EOF

# Criar script frontend
cat > /root/stacks/scripts/taktchat-frontend-startup.sh << 'EOF'
#!/bin/sh
set -e
echo "=========================================="
echo "TaktChat Frontend - Iniciando..."
echo "=========================================="
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install --legacy-peer-deps
fi
BUILD_NEEDED=true
if [ -d "build" ] && [ -f "build/index.html" ]; then
    BUILD_AGE=$(find build/index.html -mmin +5 2>/dev/null || echo "0")
    if [ "$BUILD_AGE" = "0" ]; then
        BUILD_NEEDED=false
        echo "✅ Build existente e recente, pulando rebuild..."
    fi
fi
if [ "$BUILD_NEEDED" = "true" ]; then
    echo "🔨 Compilando React (isso pode levar alguns minutos)..."
    npm run build
    if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
        echo "❌ Erro: Build não foi criado corretamente"
        exit 1
    fi
    echo "✅ Build concluído com sucesso!"
fi
echo "🚀 Iniciando servidor frontend na porta 80..."
exec node server.js
EOF

# Criar script migrate
cat > /root/stacks/scripts/taktchat-migrate-startup.sh << 'EOF'
#!/bin/sh
set -e
echo "=========================================="
echo "TaktChat Migrations - Executando..."
echo "=========================================="
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install --legacy-peer-deps
fi
echo "🔨 Compilando TypeScript..."
npm run build
echo "🗄️ Executando migrations do banco de dados..."
npx sequelize db:migrate
echo "✅ Migrations concluídas com sucesso!"
EOF

# Dar permissão de execução
chmod +x /root/stacks/scripts/*.sh

# Verificar
ls -la /root/stacks/scripts/
```

### Método 2: Via Git (Recomendado)

Crie os scripts no repositório e faça pull no servidor:

```bash
# No servidor
cd /root/taktchat
git pull origin main

# Copiar scripts (se estiverem em um diretório específico)
cp scripts/taktchat-*-startup.sh /root/stacks/scripts/
chmod +x /root/stacks/scripts/*.sh
```

---

## 🔍 Verificação

Após criar os scripts, verifique:

```bash
# Verificar se os scripts existem
ls -la /root/stacks/scripts/

# Verificar permissões (devem ser executáveis)
chmod +x /root/stacks/scripts/*.sh

# Compare permissões e conteúdo com o repositório /root/stacks.
# Não execute scripts de migrate/startup isoladamente sem janela e plano.
```

---

## Porta interna do frontend

Na stack canônica, o Traefik encaminha para a porta interna `80`:

```javascript
// frontend/server.js
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Frontend servindo na porta ${PORT}`);
});
```

---

## 📚 Referências

- Referência histórica: variantes locais com scripts/bind mounts; não correspondem à stack ativa no Portainer.
- Stack histórica: `14_taktchat_rapido.yml`
- Deploy no Portainer: `.docs/PORTAINER_GITHUB_DEPLOY.md`
- Runbook atual: `.docs/operacao/release-deploy-rollback-swarm.md`
