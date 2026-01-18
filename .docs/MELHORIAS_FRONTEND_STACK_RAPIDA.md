# Melhorias Frontend - Stack Rápida

Este documento descreve as melhorias aplicadas no frontend para funcionar igual ao backend na stack `14_taktchat_rapido.yml` (volumes montados + build em runtime).

---

## ✅ Mudanças Aplicadas

### 1. Frontend com Volumes Montados

**Antes**: Frontend usava imagem pré-construída (`zanonalivesolucoes/taktchat-frontend:latest`)

**Agora**: Frontend usa `node:20-bookworm-slim` com volumes montados, igual ao backend:

```yaml
taktchat-frontend:
  image: node:20-bookworm-slim  # ← Mesma imagem base do backend
  volumes:
    - /root/taktchat/frontend:/usr/src/app  # ← Código montado
    - taktchat_frontend_node_modules:/usr/src/app/node_modules  # ← Dependências isoladas
    - /root/stacks/scripts/taktchat-frontend-startup.sh:/usr/local/bin/taktchat-frontend-startup.sh:ro
```

**Benefícios**:
- ✅ Atualizações rápidas (apenas `git pull` + restart)
- ✅ Não precisa fazer build de imagem Docker
- ✅ Consistência com backend (mesma abordagem)

---

### 2. Script de Startup do Frontend

Criado script `/root/stacks/scripts/taktchat-frontend-startup.sh` que:
- Instala dependências automaticamente (se necessário)
- Faz build do React em runtime
- Serve arquivos estáticos via Express (`server.js`)

**Ver documentação completa**: `.docs/SCRIPTS_STARTUP_EXEMPLO.md`

---

### 3. Recursos Aumentados

**Antes**:
```yaml
resources:
  limits:
    cpus: "0.25"
    memory: 256M
```

**Agora**:
```yaml
resources:
  limits:
    cpus: "0.5"      # ← Aumentado para compilação React
    memory: 1024M     # ← Aumentado (build pode usar bastante memória)
```

**Motivo**: Compilação React em runtime requer mais recursos que servir arquivos estáticos.

---

### 4. Variáveis de Ambiente de Build

Adicionadas variáveis de ambiente para otimizar o build React:

```yaml
environment:
  - GENERATE_SOURCEMAP=false      # Desabilita source maps (mais rápido)
  - CI=true                        # Modo CI (otimizações)
  - DISABLE_ESLINT_PLUGIN=true    # Desabilita ESLint no build
  - SKIP_PREFLIGHT_CHECK=true      # Pula verificações pré-build
  - NODE_OPTIONS=--max-old-space-size=8192  # Memória para build
```

**Mesmas otimizações** usadas no `frontend/Dockerfile` para builds rápidos.

---

### 5. Porta do Servidor Ajustada

**Antes**: `server.js` usava porta `3001`

**Agora**: `server.js` usa porta `3000` (conforme Traefik)

```javascript
// frontend/server.js
const PORT = process.env.PORT || 3000;  // ← Ajustado
app.listen(PORT, () => {
  console.log(`Frontend servindo na porta ${PORT}`);
});
```

---

### 6. Volume para Node Modules do Frontend

Adicionado volume isolado para dependências do frontend:

```yaml
volumes:
  taktchat_frontend_node_modules:
    driver: local  # Dependências do frontend (isoladas)
```

**Benefício**: Evita conflitos entre dependências do backend e frontend.

---

## 🔄 Processo de Atualização

### Atualização Rápida (Frontend + Backend)

```bash
# No servidor (SSH)
cd /root/taktchat
git pull origin main

# Instalar novas dependências (se houver)
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps

# Reiniciar serviços
docker service update --force taktchat_taktchat-backend
docker service update --force taktchat_taktchat-frontend
```

**Tempo estimado**: 10-30 segundos (muito mais rápido que rebuild de imagens!)

---

## 📊 Comparação: Antes vs. Depois

| Aspecto | Antes (Imagem Pré-construída) | Depois (Volumes Montados) |
|---------|-------------------------------|---------------------------|
| **Atualização** | Build imagem Docker (15-30 min) | Git pull + restart (10-30 seg) |
| **Build** | No Docker Hub / servidor build | Em runtime (no container) |
| **Consistência** | Backend e frontend diferentes | Backend e frontend iguais |
| **Flexibilidade** | Precisa rebuild para mudanças | Mudanças imediatas |
| **Recursos** | Baixo (apenas servir estáticos) | Médio (compilação em runtime) |

---

## ⚠️ Pré-requisitos

1. **Repositório clonado no servidor**:
   ```bash
   git clone https://github.com/zanon-alive/taktchat.git /root/taktchat
   ```

2. **Dependências instaladas** (opcional - serão instaladas automaticamente):
   ```bash
   cd /root/taktchat/backend && npm install --legacy-peer-deps
   cd /root/taktchat/frontend && npm install --legacy-peer-deps
   ```

3. **Scripts de startup criados**:
   ```bash
   mkdir -p /root/stacks/scripts
   # Criar scripts (ver .docs/SCRIPTS_STARTUP_EXEMPLO.md)
   chmod +x /root/stacks/scripts/*.sh
   ```

---

## 🔍 Verificação

Após aplicar as mudanças, verifique:

### 1. Serviços Rodando

```bash
docker service ls | grep taktchat
```

Deve mostrar:
- `taktchat_taktchat-backend` - Running
- `taktchat_taktchat-frontend` - Running
- `taktchat_taktchat-migrate` - Complete

### 2. Logs do Frontend

```bash
docker service logs taktchat_taktchat-frontend --tail 50
```

Deve mostrar:
- Instalação de dependências (se necessário)
- Build do React
- Servidor Express iniciando na porta 3000

### 3. Testar Frontend

```bash
curl -I https://taktchat.com.br
```

Deve retornar `HTTP/2 200`.

---

## 📚 Documentação Relacionada

- **Scripts de startup**: `.docs/SCRIPTS_STARTUP_EXEMPLO.md`
- **Deploy no Portainer**: `.docs/PORTAINER_GITHUB_DEPLOY.md`
- **Atualização no servidor**: `.docs/ATUALIZACAO_SERVIDOR.md`
- **Stack rápida**: `14_taktchat_rapido.yml`

---

## 💡 Próximos Passos

1. ✅ Criar scripts de startup no servidor
2. ✅ Ajustar `server.js` para porta 3000
3. ✅ Testar stack completa
4. ✅ Documentar processo de atualização

---

**Status**: ✅ Frontend agora funciona igual ao backend (volumes montados + build em runtime)
