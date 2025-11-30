# Implementação: Bloqueio de Reconexão Automática

## Resumo

Implementado sistema híbrido (Memória + Banco de Dados) para bloquear reconexões automáticas após erros fatais da API WhatsApp.

## Mudanças Implementadas

### 1. Backend - Map de Bloqueio (`wbot.ts`)

**Linhas 81-87**: Criado `autoReconnectBlockedMap`
```typescript
const autoReconnectBlockedMap = new Map<number, {
  reason: string;
  blockedAt: Date;
}>();
```

**Linhas 159-181**: Funções de gerenciamento
- `blockAutoReconnect(whatsappId, reason)` - Bloqueia reconexão
- `clearAutoReconnectBlock(whatsappId)` - Desbloqueia (ações manuais)
- `isAutoReconnectBlocked(whatsappId)` - Verifica se está bloqueado

### 2. Erro 401/403 (Device Removed) - `wbot.ts`

**Linha 973**: Status alterado de `PENDING` para `DISCONNECTED`
```typescript
await whatsapp.update({ status: "DISCONNECTED", session: "" });
```

**Linha 1024**: Bloqueio de reconexão
```typescript
blockAutoReconnect(whatsapp.id, `Device removido pela API WhatsApp (${statusCode})`);
```

### 3. Logout Intencional - `wbot.ts`

**Linha 1096**: Status alterado para `DISCONNECTED`
```typescript
await whatsapp.update({ status: "DISCONNECTED", session: "" });
```

**Linha 1128**: Bloqueio de reconexão
```typescript
blockAutoReconnect(whatsapp.id, "Logout intencional do usuário");
```

### 4. Máximo de Tentativas - `wbot.ts`

**Linha 1059**: Bloqueio após 3 tentativas
```typescript
blockAutoReconnect(whatsapp.id, `Máximo de ${MAX_RECONNECTION_ATTEMPTS} tentativas de reconexão atingido`);
```

### 5. Verificação na Inicialização - `StartWhatsAppSessionUnified.ts`

**Após linha 20**: Verificação de bloqueio
```typescript
const { isAutoReconnectBlocked } = require("../../libs/wbot");
if (isAutoReconnectBlocked(whatsapp.id)) {
  logger.warn(`[StartSession] ⛔ Reconexão automática bloqueada`);
  return; // NÃO iniciar sessão
}
```

### 6. Limpeza em Ações Manuais - `WhatsAppSessionController.ts`

**Método `store` (Novo QR) - linha 39**:
```typescript
const { clearAutoReconnectBlock } = require("../libs/wbot");
clearAutoReconnectBlock(whatsapp.id);
```

**Método `update` (Tentar Novamente) - linha 68**:
```typescript
const { clearAutoReconnectBlock } = require("../libs/wbot");
clearAutoReconnectBlock(whatsapp.id);
```

## Comportamento

### Cenário 1: Erro 401/403 (Device Removed)
1. API WhatsApp retorna erro 401/403
2. Sistema limpa credenciais
3. **Status → `DISCONNECTED`** (não `PENDING`)
4. **Bloqueio ativado** em memória
5. **NÃO reconecta automaticamente**
6. Usuário clica "Novo QR" → Bloqueio limpo → Reconecta

### Cenário 2: Restart do Servidor
1. Servidor reinicia
2. `StartAllWhatsAppsSessions` tenta iniciar sessões
3. Sessões com status `DISCONNECTED` **NÃO são iniciadas** (filtro nativo)
4. Bloqueio em memória é perdido, mas status no banco persiste

### Cenário 3: Logout Intencional
1. Usuário clica "Desconectar"
2. Sistema faz logout
3. **Status → `DISCONNECTED`**
4. **Bloqueio ativado**
5. **NÃO reconecta automaticamente**

### Cenário 4: 3 Falhas de Reconexão
1. Sistema tenta reconectar 3 vezes
2. Todas falham
3. **Status → `DISCONNECTED`**
4. **Bloqueio ativado**
5. **NÃO tenta mais automaticamente**

## Logs Gerados

### Ao Bloquear
```
[wbot] ⛔ Auto-reconexão BLOQUEADA para whatsappId=4: Device removido pela API WhatsApp (401)
```

### Ao Tentar Reconectar Bloqueado
```
[StartSession] ⛔ Reconexão automática bloqueada para whatsappId=4
[StartSession] ⛔ Aguardando ação manual do usuário (Novo QR ou Tentar Novamente)
```

### Ao Desbloquear
```
[wbot] ✅ Auto-reconexão DESBLOQUEADA para whatsappId=4 (estava bloqueada por: Device removido pela API WhatsApp (401))
```

## Arquivos Modificados

1. `backend/src/libs/wbot.ts`
   - Map de bloqueio
   - Funções de gerenciamento
   - Status DISCONNECTED em erros fatais
   - Bloqueio após erros

2. `backend/src/services/WbotServices/StartWhatsAppSessionUnified.ts`
   - Verificação de bloqueio antes de iniciar

3. `backend/src/controllers/WhatsAppSessionController.ts`
   - Limpeza de bloqueio em ações manuais

## Verificação

- [ ] Erro 401 não reconecta automaticamente
- [ ] Status fica `DISCONNECTED` após erro fatal
- [ ] Restart servidor não reconecta números `DISCONNECTED`
- [ ] "Novo QR" desbloqueia e reconecta
- [ ] "Tentar Novamente" desbloqueia e reconecta
- [ ] Logs claros sobre bloqueio/desbloqueio
- [ ] Frontend exibe botões corretos para status `DISCONNECTED`

## Atualização: Correção de Loop de QR Code Expirado

### Problema Identificado
Quando o usuário gerava um QR Code e fechava o modal sem ler, o sistema entrava em loop de tentativas de reconexão porque o timer de expiração definia o status como `PENDING`.

### Solução Implementada
**Arquivo**: `backend/src/libs/wbot.ts` (linha ~1658)

**Mudanças**:
1. Status alterado de `PENDING` para `DISCONNECTED` ao expirar timer
2. Bloqueio de reconexão automática ativado
3. Logs mais claros sobre a ação necessária

```typescript
// Alterar para DISCONNECTED (não PENDING) para evitar reconexão automática
await currentWhatsapp.update({ status: "DISCONNECTED", qrcode: "" });

// Bloquear reconexão automática após expiração de QR Code
blockAutoReconnect(whatsapp.id, "QR Code expirou sem leitura");
```

### Comportamento Após Correção
1. QR Code gerado
2. Usuário fecha modal sem ler
3. Após 70 segundos, timer expira
4. Status → `DISCONNECTED`
5. Auto-reconexão bloqueada
6. Sistema para completamente
7. Usuário precisa clicar "Novo QR" para tentar novamente

### Verificação Adicional
- [ ] QR Code expirado (70s) para de tentar e fica `DISCONNECTED`
- [ ] Não há loop de tentativas após fechar modal de QR Code
- [ ] Logs mostram bloqueio após expiração

## Correção Adicional: Erro 428 sem Credenciais

### Problema Identificado
Quando ocorria erro 428 (Connection Terminated) sem credenciais válidas, o sistema agendava automaticamente uma nova sessão após 3 segundos para gerar QR Code. Isso causava loop infinito de tentativas.

### Solução Implementada
**Arquivo**: `backend/src/libs/wbot.ts` (linhas 816 e 863-868)

**Mudanças**:
1. Status alterado de `PENDING` para `DISCONNECTED`
2. Removido `setTimeout` que agendava nova sessão
3. Bloqueio de reconexão automática ativado

```typescript
// Status DISCONNECTED em vez de PENDING
await whatsapp.update({ status: "DISCONNECTED", session: "" });

// Bloquear reconexão automática
blockAutoReconnect(whatsapp.id, "Erro 428 sem credenciais válidas");
logger.warn(`[wbot] ⛔ Auto-reconexão bloqueada. Use o botão 'Novo QR' para tentar novamente.`);
```

### Comportamento Após Correção
1. Erro 428 ocorre (ex: após QR Code expirar)
2. Sistema limpa sessão
3. Status → `DISCONNECTED`
4. Bloqueio ativado
5. **NÃO agenda nova tentativa**
6. Usuário deve clicar "Novo QR" manualmente
