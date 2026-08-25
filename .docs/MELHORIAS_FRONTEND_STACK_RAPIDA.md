# Melhorias de frontend da stack rápida — histórico

> **Documento histórico.** Registra decisões de variantes antigas com bind mounts. Não descreve a produção atual.
>
> Produção usa frontend em imagem GHCR fixada por digest e sem mounts. A definição ativa está no Portainer; `14_taktchat.yml` local é referência não confirmada. Não use este arquivo como runbook.

---

## ✅ Mudanças Aplicadas

### 1. Frontend com Volumes Montados

**Antes**: Frontend usava imagem pré-construída (`zanonalivesolucoes/taktchat-frontend:latest`)

**Na variante histórica**: o frontend passou a usar `node:20-bookworm-slim` com volumes montados:

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

### 2. Script de startup do frontend (histórico)

Criado script `/root/stacks/scripts/taktchat-frontend-startup.sh` que:
- Instala dependências automaticamente (se necessário)
- Fazia build do React em runtime
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

### 5. Porta usada pela variante histórica

**Antes**: `server.js` usava porta `3001`

**Variante histórica**: `server.js` usava porta `3000`.

**Stack atual**: o Traefik encaminha para a porta interna `80`.

```javascript
// frontend/server.js
const PORT = process.env.PORT || 80;
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

## Processo atual

O fluxo abaixo não é mais recomendado, pois reiniciar o frontend sem build prévio pode publicar artefatos antigos ou incompletos. Siga o runbook canônico, faça o build do frontend no host e atualize apenas os serviços afetados.

```bash
# No servidor (SSH)
cd /root/taktchat
git pull origin main

# Instalar novas dependências (se houver)
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps

# Antes do restart do frontend, produzir e validar o build no host.
# Atualizar serviços afetados:
docker service update --force taktchat_taktchat-backend
docker service update --force taktchat_taktchat-frontend
```

O tempo depende de dependências, build, migrations e convergência do Swarm.

---

## 📊 Comparação: Antes vs. Depois

| Aspecto | Antes (Imagem Pré-construída) | Depois (Volumes Montados) |
|---------|-------------------------------|---------------------------|
| **Atualização** | Build imagem Docker (15-30 min) | Git pull + restart (10-30 seg) |
| **Build** | No Docker Hub / servidor build | Histórico: runtime; atual: host |
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
- Servidor de arquivos iniciando na porta interna 80

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
- **Referência histórica usada neste documento**: `14_taktchat.yml` com bind mounts; não existe nesse caminho na VPS auditada.
- **Stack rápida histórica**: `14_taktchat_rapido.yml`

---

## Registro histórico

1. ✅ Criar scripts de startup no servidor
2. ✅ Ajustar `server.js` para porta 3000
3. ✅ Testar stack completa
4. ✅ Documentar processo de atualização

---

**Status:** substituído pela stack canônica. O conteúdo permanece apenas para rastreabilidade.
