# Deploy no Portainer via GitHub - Stack Rápida

Este documento explica como configurar e usar a stack `14_taktchat_rapido.yml` no Portainer com integração GitHub.

## 📋 Pré-requisitos

1. **Portainer instalado e acessível**
2. **Acesso ao repositório GitHub** (público ou com autenticação)
3. **Servidor VPS com acesso SSH** (para configuração inicial)

---

## ⚠️ Considerações Importantes

A stack `14_taktchat_rapido.yml` usa **volumes montados** que apontam para caminhos fixos no servidor:
- `/root/taktchat/backend` - Código do backend
- `/root/stacks/scripts/` - Scripts de startup

Isso significa que o **código precisa estar clonado no servidor ANTES** de fazer deploy via Portainer.

---

## 🚀 Opção 1: Portainer com Git Repository (Recomendado)

### Passo 1: Preparar Servidor (SSH)

Primeiro, você precisa clonar o repositório no servidor:

```bash
# Conectar ao servidor
ssh root@seu-servidor.com

# Clonar repositório (se ainda não estiver clonado)
cd /root
git clone https://github.com/zanon-alive/taktchat.git taktchat

# Instalar dependências do backend
cd /root/taktchat/backend
npm install --legacy-peer-deps

# Criar diretório de scripts (se não existir)
mkdir -p /root/stacks/scripts

# Copiar scripts de startup (se necessário)
# Os scripts devem estar em /root/stacks/scripts/
```

### Passo 2: Configurar Stack no Portainer

1. **Acesse o Portainer**
2. **Vá em Stacks** (menu lateral)
3. **Clique em "Add stack"**
4. **Escolha "Repository"** (não "Web editor")
5. **Configure:**
   - **Repository URL**: `https://github.com/zanon-alive/taktchat.git`
   - **Repository Reference**: `main` (ou sua branch)
   - **Compose path**: `14_taktchat_rapido.yml`
   - **Name**: `taktchat` (ou o nome desejado)
   - **Build method**: `Repository` (ou `Web editor` se preferir colar o conteúdo)

6. **Clique em "Deploy the stack"**

### Passo 3: Configurar Autenticação (Se Repositório Privado)

Se o repositório for privado:

1. **No Portainer**, vá em **Settings → Git settings**
2. **Adicione credenciais Git:**
   - **Git username**: seu usuário GitHub
   - **Git password/token**: seu token pessoal do GitHub (PAT)

Ou configure na stack:
- Marque **"Authentication"**
- Preencha usuário e token

---

## 🔧 Opção 2: Portainer via Web Editor (Manual)

Se preferir copiar/colar o conteúdo:

1. **Acesse o Portainer**
2. **Vá em Stacks → Add stack**
3. **Escolha "Web editor"**
4. **Copie o conteúdo de `14_taktchat_rapido.yml`**
5. **Cole no editor**
6. **Ajuste caminhos se necessário** (conforme estrutura do seu servidor)
7. **Clique em "Deploy the stack"**

---

## 🔄 Atualizações

### Método 1: Via Portainer (Recomendado)

1. **No Portainer**, vá em **Stacks → taktchat**
2. **Clique em "Editor"** (ou "Update the stack")
3. **Se usar Git Repository:**
   - Clique em **"Pull and redeploy"** ou **"Update the stack"**
   - O Portainer fará pull do repositório
4. **Se usar Web Editor:**
   - Edite o YAML
   - Salve as alterações

**⚠️ IMPORTANTE**: O código no servidor (`/root/taktchat`) NÃO é atualizado automaticamente. Você precisa fazer git pull manualmente:

```bash
# No servidor (SSH)
cd /root/taktchat
git pull origin main
cd backend && npm install --legacy-peer-deps  # Se houver novas dependências
docker service update --force taktchat_taktchat-backend
```

### Método 2: Atualização Rápida (SSH)

Como a stack usa volumes montados, você pode atualizar apenas o código:

```bash
# No servidor (SSH)
cd /root/taktchat
git pull origin main
cd backend && npm install --legacy-peer-deps  # Se necessário
docker service update --force taktchat_taktchat-backend
```

**Tempo**: 10-30 segundos (muito mais rápido que rebuild!)

---

## 🔍 Verificação

Após o deploy, verifique:

### 1. Verificar Serviços no Portainer

1. **Vá em Stacks → taktchat**
2. **Verifique status dos serviços:**
   - `taktchat-backend` deve estar `Running`
   - `taktchat-frontend` deve estar `Running`
   - `taktchat-migrate` deve estar `Complete` (executa uma vez)

### 2. Verificar Logs

```bash
# No servidor (SSH)
docker service logs taktchat_taktchat-backend --tail 50
docker service logs taktchat_taktchat-frontend --tail 50
```

Ou no Portainer:
- **Stacks → taktchat → taktchat-backend → Logs**

### 3. Testar Endpoints

```bash
# Healthcheck do backend
curl https://api.taktchat.com.br/health

# Frontend
curl -I https://taktchat.com.br
```

---

## 📝 Estrutura de Diretórios Necessária

Para a stack funcionar, você precisa ter no servidor:

```
/root/
├── taktchat/                  # Repositório clonado
│   └── backend/               # Código do backend
│       ├── package.json
│       ├── src/
│       └── ...
└── stacks/
    └── scripts/               # Scripts de startup
        ├── taktchat-backend-startup.sh
        └── taktchat-migrate-startup.sh
```

---

## ⚙️ Configuração Alternativa (Portainer + Build Automático)

Se você quiser que o Portainer faça tudo automaticamente (incluindo git pull), você poderia:

### Criar um Script de Atualização Automática

```bash
#!/bin/bash
# /root/stacks/update-taktchat.sh

cd /root/taktchat
git pull origin main
cd backend
npm install --legacy-peer-deps
docker service update --force taktchat_taktchat-backend
```

E executar via cron ou webhook do GitHub.

---

## 🔗 Diferenças: Portainer vs Stack Normal

| Aspecto | Stack Normal (docker stack deploy) | Portainer |
|---------|-------------------------------------|-----------|
| **Deploy inicial** | `docker stack deploy -c file.yml stack` | Interface web Portainer |
| **Atualizações** | Editar YAML + `docker stack deploy` | Editor web ou Pull do Git |
| **Gestão visual** | ❌ Apenas CLI | ✅ Interface web |
| **Monitoramento** | `docker stack ps` | ✅ Dashboard visual |
| **Logs** | `docker service logs` | ✅ Interface integrada |
| **Código no servidor** | ✅ Mesmo processo | ⚠️ Precisa git pull manual |

---

## 🐛 Troubleshooting

### Problema: "No such file or directory: /root/taktchat/backend"

**Solução**: O repositório não está clonado no servidor.
```bash
ssh root@servidor
cd /root
git clone https://github.com/zanon-alive/taktchat.git taktchat
cd taktchat/backend
npm install --legacy-peer-deps
```

### Problema: "Script not found: /root/stacks/scripts/taktchat-backend-startup.sh"

**Solução**: Os scripts não existem. Você precisa criá-los ou ajustar a stack para não usá-los.

### Problema: Serviço não inicia após deploy

**Solução**: 
1. Verifique logs no Portainer
2. Verifique se o código está no servidor
3. Verifique se as dependências estão instaladas
4. Verifique permissões dos arquivos

### Problema: Portainer não consegue acessar repositório privado

**Solução**: 
1. Configure autenticação Git no Portainer (Settings → Git settings)
2. Ou use um token pessoal do GitHub (PAT)
3. Ou torne o repositório público temporariamente

---

## 📚 Referências

- Stack rápida: `14_taktchat_rapido.yml`
- Stack com imagens: `14_taktchat.yml`
- Comparação: `.docs/COMPARACAO_STACKS.md`
- Atualização no servidor: `.docs/ATUALIZACAO_SERVIDOR.md`

---

## 💡 Dica: Automação Completa

Para automação completa (GitHub → Portainer → Servidor), considere:

1. **GitHub Actions**: Fazer git pull no servidor quando houver push
2. **Webhook do GitHub**: Notificar servidor para fazer pull
3. **Cron job**: Verificar atualizações periodicamente
4. **Portainer API**: Integrar com CI/CD

Mais detalhes em: `.docs/operacao/` (quando disponível)
