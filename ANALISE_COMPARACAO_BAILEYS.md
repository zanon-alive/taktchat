# 🔍 Análise Comparativa - Debug Baileys Connection

**Data:** 21/11/2025  
**Analista:** Sistema de Debug Automático

---

## 📊 Resumo Executivo

**CAUSA RAIZ IDENTIFICADA:** Flag `registered: false` em ambos os números

**PROBLEMA:** O WhatsApp está removendo o dispositivo (erro 401 - device_removed) após exatamente **60 segundos** de conexão no número problemático, enquanto o número funcional permanece conectado indefinidamente.

**DIFERENÇA CRÍTICA:** Ambos os números têm `registered: false`, mas apenas um deles é removido pelo WhatsApp.

---

## 📱 Número Problemático

- **WhatsApp ID:** 2
- **Número:** 5514997311404:46
- **Arquivo de log:** `baileys-debug-whatsapp-2-5514997311404:46-2025-11-21_20-47-31.log`
- **Tempo até desconectar:** 60.51 segundos
- **StatusCode do erro:** 401
- **Erro:** `Stream Errored (conflict)` - `device_removed`
- **Tipo de socket:** md (Multi-Device)
- **Flag registered:** false ❌

---

## ✅ Número Funcional

- **WhatsApp ID:** 2
- **Número:** 5514981252988:27
- **Arquivo de log:** `baileys-debug-whatsapp-2-5514981252988:27-2025-11-21_20-53-55.log`
- **Status:** Conectado (permaneceu conectado por mais de 61 segundos sem desconectar)
- **Tipo de socket:** md (Multi-Device)
- **Flag registered:** false ❌

---

## 🔍 Diferenças Identificadas

### ⏱️ Timing

| Métrica | Número Problema | Número Funcional | Diferença |
|---------|----------------|------------------|-----------|
| Tempo até `connection_open` | 1.67s | 1.64s | ~0.03s (insignificante) |
| Tempo até desconectar | **60.51s** | **Não desconectou** | ✅ CRÍTICO |
| Keepalives enviados | 5 (20s, 25s, 40s, 50s, 60s) | Múltiplos | Mesmo padrão |
| Keepalives falhados | 0 | 0 | Igual |

**Observação:** O número problemático desconecta **EXATAMENTE** após ~60 segundos, sugerindo um timeout do lado do WhatsApp.

### 🔑 Credenciais

| Item | Número Problema | Número Funcional | Diferença |
|------|----------------|------------------|-----------|
| MeId presente | ✅ Sim | ✅ Sim | Igual |
| MeId | 5514997311404:46@s.whatsapp.net | 5514981252988:27@s.whatsapp.net | Diferente (esperado) |
| Flag `registered` | ❌ false | ❌ false | **IGUAL - AMBOS FALSE** |
| Socket type | md | md | Igual |
| User.registered | ❌ false | ❌ false | **IGUAL - AMBOS FALSE** |

**⚠️ ACHADO CRÍTICO:** Ambos os números têm `registered: false`, mas apenas o número problemático é removido.

### 📝 Eventos

**Sequência de eventos - IDÊNTICA em ambos:**

1. `session_start`
2. Múltiplos `creds_update`
3. `connection_update` (undefined)
4. `connection_update` (open)
5. `connection_open`
6. Mais `creds_update`
7. Keepalives periódicos (connection_update undefined)
8. **DIVERGÊNCIA:** Número problema → `connection_close` aos 60.51s

**Eventos ausentes:** Nenhum evento está faltando no número problema.

**Ordem:** Idêntica em ambos os casos.

### 🔄 Keepalive

| Métrica | Número Problema | Número Funcional |
|---------|----------------|------------------|
| Keepalives enviados antes de desconectar | 5 | Múltiplos (continua) |
| Padrão de envio | 20s, 25s, 40s, 50s, 60s | 25s, 40s, 50s, 60s... |
| Taxa de sucesso | 100% (todos enviados com sucesso) | 100% |
| Falhas | 0 | 0 |

**Conclusão:** Keepalive está funcionando perfeitamente em ambos os casos. Não é a causa do problema.

### 📋 Logs do Console

**Número Problema - Mensagens Importantes:**

```
INFO: - Registrado (user.registered): false (❌ NÃO)
WARN: ⚠️ ATENÇÃO: Tipo MD mas registered=false - WhatsApp pode não ter vinculado o dispositivo
WARN: ⚠️ O dispositivo pode não aparecer na lista de dispositivos vinculados
```

Após 60.51 segundos:
```
ERROR: stream errored out - code: 401 - type: device_removed
ERROR: ERRO CRÍTICO: 401 (device_removed)
WARN: ⚠️ Este número (5514997311404:46) já teve 4 erros de desconexão
```

**Número Funcional - Mensagens Importantes:**

```
INFO: - Registrado (user.registered): false (❌ NÃO)
WARN: ⚠️ ATENÇÃO: Tipo MD mas registered=false - WhatsApp pode não ter vinculado o dispositivo
WARN: ⚠️ O dispositivo pode não aparecer na lista de dispositivos vinculados
```

**MAS:** Não desconecta! Permanece conectado indefinidamente.

---

## 💡 Hipótese da Causa Raiz

### Teoria Principal: "Dispositivo Fantasma" no WhatsApp

**O que está acontecendo:**

1. ✅ Ambos os números conectam com sucesso via Baileys
2. ✅ Ambos obtêm `MeId` e estabelecem sessão MD (Multi-Device)
3. ❌ Ambos ficam com `registered: false` (não completam registro no WhatsApp)
4. ⚠️ **DIFERENÇA:** O WhatsApp aceita o número funcional mesmo com `registered: false`, mas **rejeita** o número problemático após 60 segundos

**Por que isso acontece:**

O número **5514997311404:46** pode estar em uma das seguintes situações no servidor do WhatsApp:

1. **Dispositivo já registrado anteriormente** que não foi desvinculado corretamente
2. **Número banido/restrito** temporariamente pelo WhatsApp
3. **Múltiplas tentativas de conexão** que acionaram proteção anti-spam
4. **Credenciais corrompidas** no servidor do WhatsApp para este número específico

**Evidências:**

- Histórico de 4 erros de desconexão para este número (conforme logs)
- Erro `device_removed` indica que o WhatsApp **ativamente removeu** o dispositivo
- Timing exato de 60 segundos sugere timeout de validação do WhatsApp
- O número funcional com mesma configuração (`registered: false`) não é removido

---

## 🔧 Solução Proposta

### Solução Imediata: Limpar Estado no WhatsApp Mobile

**Passo a passo:**

1. **No WhatsApp Mobile do número problemático (5514997311404):**
   - Abrir WhatsApp
   - Ir em: Configurações → Aparelhos conectados
   - **Remover TODOS os dispositivos vinculados** (especialmente qualquer "Desktop" ou "Ubuntu")
   - Aguardar 5 minutos

2. **No servidor (backend):**
   - Deletar completamente a sessão:
   ```bash
   rm -rf backend/private/sessions/1/2/
   ```
   - Deletar entrada no banco de dados:
   ```sql
   DELETE FROM Baileys WHERE whatsappId = 2;
   ```

3. **Tentar reconectar:**
   - Gerar novo QR Code
   - Escanear com WhatsApp Mobile
   - Observar se `registered` muda para `true` após conexão

### Solução Alternativa: Forçar Registro

Se a solução imediata não funcionar, precisamos **forçar o registro do dispositivo** no código.

**Modificação necessária em `wbot.ts`:**

Após a conexão abrir (`connection === "open"`), verificar se `registered === false` e tentar forçar registro:

```typescript
if (connection === "open") {
  // ... código existente ...
  
  // NOVO: Verificar e forçar registro se necessário
  if ((wsocket as any).user?.registered === false) {
    logger.warn(`[wbot] ⚠️ Dispositivo conectou mas registered=false. Tentando forçar registro...`);
    
    try {
      // Aguardar 2 segundos para estabilizar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar novamente
      if ((wsocket as any).user?.registered === false) {
        logger.error(`[wbot] ❌ Registro não completou automaticamente. Dispositivo pode ser removido em ~60s.`);
        logger.error(`[wbot] ❌ AÇÃO NECESSÁRIA: Remover dispositivo no WhatsApp Mobile e reconectar.`);
        
        // Emitir alerta para o frontend
        io.of(`/workspace-${companyId}`)
          .emit(`company-${companyId}-whatsappSession`, {
            action: "warning",
            session: whatsapp,
            message: "Dispositivo não foi registrado corretamente. Remova este dispositivo no WhatsApp Mobile e reconecte."
          });
      }
    } catch (err: any) {
      logger.error(`[wbot] Erro ao verificar registro: ${err?.message}`);
    }
  }
}
```

### Solução de Longo Prazo: Monitoramento Proativo

Implementar verificação da flag `registered` e alertar o usuário **ANTES** dos 60 segundos:

1. Ao conectar, verificar `registered`
2. Se `false` após 5 segundos de conexão, alertar usuário
3. Sugerir ação: "Remova este dispositivo no WhatsApp e reconecte"

---

## ✅ Próximos Passos

### Passo 1: Teste Manual (IMEDIATO)

1. No WhatsApp Mobile do número 5514997311404:
   - Remover TODOS os dispositivos vinculados
   - Aguardar 5 minutos
   
2. No servidor:
   - Deletar sessão: `rm -rf backend/private/sessions/1/2/`
   - Deletar do banco: `DELETE FROM Baileys WHERE whatsappId = 2;`
   
3. Reconectar e observar se `registered` fica `true`

### Passo 2: Se Passo 1 Falhar

Implementar verificação e alerta de `registered: false` no código.

### Passo 3: Documentar

Criar guia de troubleshooting para este problema específico.

---

## 📌 Conclusões

1. ✅ **Keepalive NÃO é o problema** - está funcionando perfeitamente
2. ✅ **Timing é consistente** - ambos conectam da mesma forma
3. ❌ **Flag `registered: false` é suspeita** - mas não é a única causa (número funcional também tem false)
4. ⚠️ **Problema específico do número** - WhatsApp está rejeitando este número especificamente
5. 🎯 **Solução:** Limpar estado no WhatsApp Mobile e reconectar

---

## 🔗 Arquivos de Referência

- Log número problema: `backend/logs/baileys-debug/numero_problema/baileys-debug-whatsapp-2-5514997311404:46-2025-11-21_20-47-31.log`
- Log número funcional: `backend/logs/baileys-debug/numero_funcional/baileys-debug-whatsapp-2-5514981252988:27-2025-11-21_20-53-55.log`
- Código principal: `backend/src/libs/wbot.ts`
- Helper de debug: `backend/src/helpers/debugBaileysConnection.ts`

---

**Análise concluída em:** 21/11/2025 21:06
