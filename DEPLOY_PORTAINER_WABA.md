# 🚀 Deploy Portainer com WhatsApp Business API

## 🐛 Problema: Webhook não Verifica

**Erro:** "The callback URL or verify token couldn't be validated"

**Causa:** Faltavam variáveis de ambiente no `docker-compose.yml`

---

## ✅ Correção Aplicada

### Variáveis Adicionadas no docker-compose.yml

```yaml
environment:
  # URLs de Produção (em vez de localhost)
  FRONTEND_URL: ${FRONTEND_URL:-https://taktchat.alivesolucoes.com.br}
  BACKEND_URL: ${BACKEND_URL:-https://taktchat-api.alivesolucoes.com.br}
  
  # WhatsApp Business API (Meta) - NOVO!
  WABA_WEBHOOK_VERIFY_TOKEN: ${WABA_WEBHOOK_VERIFY_TOKEN:-602536nblumi2025}
  WABA_API_VERSION: ${WABA_API_VERSION:-v18.0}
```

---

## 🔧 Como Fazer Deploy no Portainer

### Opção 1: Atualizar Stack Existente (Recomendado)

1. **Acessar Portainer**
   ```
   https://seu-portainer.com
   ```

2. **Ir para a Stack**
   - Stacks → `nobreluminarias` (ou nome da sua stack)
   - Clicar em **"Editor"**

3. **Adicionar as Variáveis**
   
   Encontre a seção `environment:` do serviço `backend` e adicione:

   ```yaml
   environment:
     # ... suas variáveis existentes ...
     
     # ADICIONAR ESTAS LINHAS:
     FRONTEND_URL: https://taktchat.alivesolucoes.com.br
     BACKEND_URL: https://taktchat-api.alivesolucoes.com.br
     WABA_WEBHOOK_VERIFY_TOKEN: 602536nblumi2025
     WABA_API_VERSION: v18.0
   ```

4. **Atualizar Stack**
   - Clicar em **"Update the stack"**
   - ✅ Marcar: "Re-pull image and redeploy"
   - Clicar em **"Update"**

5. **Aguardar Deploy**
   - Portainer vai recriar os containers
   - Aguardar 1-2 minutos

---

### Opção 2: Stack Completa Nova

Se quiser criar uma stack do zero, use este arquivo completo:

```yaml
version: "3.8"
services:
  backend:
    image: seu-registry/whaticket-backend:latest  # Ajuste conforme seu registry
    container_name: whaticket-backend
    restart: always
    environment:
      NODE_ENV: production
      DB_DIALECT: postgres
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: whaticket
      DB_USER: postgres
      DB_PASS: efe487b6a861100fb704ad9f5c160cb8
      TZ: America/Sao_Paulo
      
      # URLs de Produção
      FRONTEND_URL: https://taktchat.alivesolucoes.com.br
      BACKEND_URL: https://taktchat-api.alivesolucoes.com.br
      
      # Redis
      REDIS_URI: redis://redis:6379/0
      REDIS_URI_ACK: redis://redis:6379/0
      
      # Bull
      BULL_USER: admin
      BULL_PASS: admin
      
      # JWT
      JWT_SECRET: supersecret
      JWT_REFRESH_SECRET: supersecretrefresh
      
      # Sessões
      SESSIONS_DRIVER: fs
      SESSIONS_DIR: private/sessions
      
      # Validação de contatos
      CONTACT_FILTER_ASYNC_VALIDATION: "false"
      CONTACT_VALIDATION_BATCH_SIZE: "50"
      CONTACT_FILTER_DIRECT_SQL: "false"
      CONTACT_FILTER_VALIDATE_WHATSAPP: "true"
      CONTACT_FILTER_INSERT_CHUNK_SIZE: "1000"
      
      # WhatsApp Business API (Meta) - IMPORTANTE!
      WABA_WEBHOOK_VERIFY_TOKEN: 602536nblumi2025
      WABA_API_VERSION: v18.0
      
    networks:
      - nobreluminarias
    ports:
      - "8080:8080"
    volumes:
      - backend-public:/app/public
      - backend-private:/app/private

  frontend:
    image: seu-registry/whaticket-frontend:latest  # Ajuste conforme seu registry
    container_name: whaticket-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - nobreluminarias

  redis:
    image: redis:6.2-alpine
    container_name: whaticket-redis
    restart: always
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    networks:
      - nobreluminarias
    volumes:
      - redis-data:/data

networks:
  nobreluminarias:
    external: true

volumes:
  redis-data:
  backend-public:
  backend-private:
```

---

## 🧪 Testar Após Deploy

### 1. Verificar Backend Rodando

```bash
# SSH na VPS
ssh usuario@seu-servidor.com

# Ver logs do backend
docker logs -f whaticket-backend

# Deve aparecer:
# Server started on port 8080
# Connected to database
```

### 2. Testar Endpoint do Webhook

```bash
# No seu computador ou SSH
curl https://taktchat-api.alivesolucoes.com.br/webhooks/whatsapp
```

**Esperado:** Alguma resposta (não erro 404)

### 3. Verificar Variáveis

```bash
# SSH na VPS
docker exec whaticket-backend env | grep WABA

# Deve mostrar:
# WABA_WEBHOOK_VERIFY_TOKEN=602536nblumi2025
# WABA_API_VERSION=v18.0
```

---

## 🔄 Configurar Webhook na Meta (Novamente)

Após deploy, tente configurar o webhook novamente:

### 1. Acessar Meta Business Manager

```
https://business.facebook.com
```

### 2. WhatsApp → Configuration → Webhooks

**Callback URL:**
```
https://taktchat-api.alivesolucoes.com.br/webhooks/whatsapp
```

**Verify Token:**
```
602536nblumi2025
```

### 3. Clicar "Verify and Save"

✅ **Deve aparecer:** "Webhook verified successfully"

### 4. Subscribe aos Eventos

- ✅ `messages`
- ✅ `message_status`

---

## ❌ Troubleshooting

### Erro: "Couldn't validate webhook"

**Verificar:**

1. **Backend está rodando?**
   ```bash
   docker ps | grep backend
   curl https://taktchat-api.alivesolucoes.com.br/health
   ```

2. **Variável está configurada?**
   ```bash
   docker exec whaticket-backend env | grep WABA_WEBHOOK_VERIFY_TOKEN
   ```

3. **HTTPS funcionando?**
   ```bash
   curl -I https://taktchat.alivesolucoes.com.br
   # Deve retornar 200 ou 302
   ```

4. **Rota do webhook existe?**
   - Verificar logs: `docker logs whaticket-backend`
   - Procurar por: "GET /webhooks/whatsapp"

### Erro: "Connection refused"

**Causa:** Backend não está acessível

**Solução:**
```bash
# Verificar se container está rodando
docker ps -a | grep backend

# Se parado, iniciar
docker start whaticket-backend

# Ver logs de erro
docker logs whaticket-backend --tail 100
```

### Erro: "Verify token mismatch"

**Causa:** Token diferente no código vs Meta

**Solução:**
1. Verificar token no Portainer
2. Deve ser EXATAMENTE: `602536nblumi2025`
3. Sem espaços, sem caracteres extras
4. Restart container se mudou

---

## 📊 Verificação Completa

### Checklist Pré-Deploy

- [ ] `docker-compose.yml` atualizado com variáveis WABA
- [ ] `BACKEND_URL` usa domínio real (não localhost)
- [ ] `WABA_WEBHOOK_VERIFY_TOKEN` igual ao usado na Meta
- [ ] Images buildadas e enviadas ao registry (se usar)
- [ ] Banco de dados com migration executada

### Checklist Pós-Deploy

- [ ] Backend rodando (`docker ps`)
- [ ] Logs sem erros críticos (`docker logs`)
- [ ] Variáveis configuradas (`docker exec ... env | grep WABA`)
- [ ] Endpoint webhook acessível (curl)
- [ ] HTTPS funcionando (certificado válido)
- [ ] Meta webhook verificado com sucesso
- [ ] Eventos subscritos (messages, message_status)

---

## 🎯 Estrutura Final das Variáveis

### Variáveis Globais (Backend)

Estas são configuradas no `docker-compose.yml` e aplicam-se a TODAS as conexões:

```yaml
WABA_WEBHOOK_VERIFY_TOKEN: 602536nblumi2025  # Token para verificação do webhook
WABA_API_VERSION: v18.0                       # Versão da API Meta
BACKEND_URL: https://taktchat-api.alivesolucoes.com.br  # URL pública do backend
```

### Variáveis Por Conexão (Banco de Dados)

Estas são salvas no banco para CADA conexão API Oficial:

- `channelType`: "official"
- `wabaPhoneNumberId`: "123456789012345"
- `wabaBusinessAccountId`: "987654321098765"
- `wabaAccessToken`: "EAAxxxxxxxx"
- `wabaWebhookVerifyToken`: "602536nblumi2025" (mesmo da global)

---

## 🚀 Comandos Úteis

### Restart Serviços

```bash
# Restart apenas backend
docker restart whaticket-backend

# Restart stack inteira no Portainer
# (via interface web)
```

### Ver Logs em Tempo Real

```bash
# Backend
docker logs -f whaticket-backend

# Redis
docker logs -f whaticket-redis

# Todos
docker-compose logs -f
```

### Executar Migration

```bash
# Se precisar rodar migrations
docker exec -it whaticket-backend npm run migrate
```

### Verificar Health

```bash
# Testar backend
curl https://taktchat-api.alivesolucoes.com.br/health

# Testar webhook
curl -X GET "https://taktchat-api.alivesolucoes.com.br/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=602536nblumi2025&hub.challenge=test123"

# Deve retornar: test123
```

---

## ✅ Próximos Passos

Após configurar o webhook com sucesso:

1. **Criar Conexão API Oficial no Whaticket**
   - Menu → Conexões → Nova Conexão
   - Tipo: API Oficial
   - Preencher credenciais Meta

2. **Testar Envio**
   - Enviar mensagem teste
   - Verificar entrega

3. **Testar Recebimento**
   - Enviar mensagem para o número
   - Verificar se cria ticket

4. **Monitorar**
   - Logs do backend
   - Webhook events na Meta
   - Erros no console

---

## 📝 Notas Importantes

### Segurança

- ⚠️ **Nunca commitar** tokens no Git
- ✅ Usar variáveis de ambiente
- ✅ Rotate tokens a cada 60 dias
- ✅ HTTPS obrigatório

### Performance

- Redis configurado para acks
- Sessions em volume persistente
- Logs com rotação automática

### Backup

- Fazer backup do volume `backend-private` (sessões Baileys)
- Fazer backup do banco PostgreSQL
- Anotar tokens e credenciais em local seguro

---

## 🎉 Sucesso!

Quando o webhook verificar com sucesso:

✅ Backend configurado corretamente  
✅ Variáveis de ambiente OK  
✅ HTTPS funcionando  
✅ Rota do webhook ativa  
✅ Token correto  
✅ Meta consegue acessar seu servidor  

**Agora você pode usar a API Oficial do WhatsApp!** 🚀

---

*Documento criado em: 17/11/2024 às 03:25*  
*Versão: 1.0*  
*Status: Pronto para produção*
