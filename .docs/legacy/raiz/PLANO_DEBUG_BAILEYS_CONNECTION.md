# 🔍 DEBUG BAILEYS CONNECTION - Plano de Implementação

**Branch:** `debug/baileys-connection`  
**Data de início:** 21/11/2024  
**Objetivo:** Identificar por que um número específico desconecta após ler o QR Code do WhatsApp via Baileys

---

## 📋 Problema

Após escanear o QR Code do WhatsApp para conectar via Baileys, um número específico está desconectando. Precisamos:
1. Registrar logs detalhados da tentativa de conexão desse número
2. Conectar com outro número funcional para comparação
3. Identificar diferenças nos logs para entender o problema
4. Retornar mensagem clara ao usuário sobre o que está acontecendo

---

## ✅ Passo 1: Implementar Logging Detalhado (CONCLUÍDO)

### O que foi implementado:

#### 1. Módulo de Debug Logging
**Arquivo:** `backend/src/helpers/debugBaileysConnection.ts`

Funções criadas:
- `initDebugLog(whatsappId, phoneNumber)` - Inicializa arquivo de log com timestamp
- `logDebugEvent(whatsappId, eventType, data, stackTrace?)` - Registra eventos com timing preciso
- `closeDebugLog(whatsappId, summary?)` - Finaliza log com resumo de eventos
- `hasActiveLog(whatsappId)` - Verifica se há log ativo
- `getActiveLogInfo(whatsappId)` - Obtém informações do log ativo

Características:
- Logs salvos em: `backend/logs/baileys-debug/`
- Nome do arquivo: `baileys-debug-whatsapp-{id}-{phoneNumber}-{timestamp}.log`
- Cada evento inclui timestamp em milissegundos e tempo decorrido desde início
- Resumo automático ao fechar com contagem de eventos por tipo

#### 2. Modificações no wbot.ts
**Arquivo:** `backend/src/libs/wbot.ts`

Adicionado import:
```typescript
import { initDebugLog, logDebugEvent, closeDebugLog, hasActiveLog } from "../helpers/debugBaileysConnection";
```

Eventos rastreados:

| Evento | Quando | Dados Capturados |
|--------|--------|------------------|
| `session_start` | Início da sessão | Nome, credenciais, versão WA Web |
| `creds_update` | Credenciais atualizadas | Estado before/after de MeId e registered |
| `connection_update` | Mudança de estado | Connection, statusCode, errorMessage, timing |
| `connection_open` | Conexão estabelecida | UserJid, socketType, userRegistered, timing |
| `connection_close` | Desconexão | StatusCode, erro completo, timing desde open |
| `qr_code_generated` | QR Code gerado | Tentativa, hasMeId, isRegistered |
| `qr_code_scanned` | QR Code escaneado | Tempo decorrido, MeId obtido |

Localização das modificações no código:
- Linha ~331: Inicialização do debug log
- Linha ~350: Listener de `creds.update`
- Linha ~547: Log de `connection.update`
- Linha ~608: Log de `connection_close`
- Linha ~1018: Log de `connection_open`
- Linha ~1452: Log de `qr_code_generated`
- Linha ~1469: Log de `qr_code_scanned`
- Linha ~922: Finalização do log ao desconectar

### Compilação:
✅ Código compilado com sucesso (`npm run build`)

---

## 📝 Passo 2: Testar com Número Problemático

### Objetivo:
Coletar logs completos da tentativa de conexão do número que está desconectando.

### Como executar:

1. **Preparar ambiente:**
   ```bash
   cd /home/zanonr/desenvolvimento/taktchat
   git checkout debug/baileys-connection
   ```

2. **Limpar credenciais antigas (opcional mas recomendado):**
   - Acessar banco de dados e deletar entrada da tabela `Baileys` para o whatsappId
   - OU deletar pasta da sessão em `backend/private/sessions/{companyId}/{whatsappId}/`

3. **Iniciar backend em modo desenvolvimento:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Iniciar frontend (em outro terminal):**
   ```bash
   cd frontend
   npm start
   ```

5. **Tentar conectar o número problemático:**
   - Acessar sistema via frontend
   - Clicar para conectar/adicionar a conexão do WhatsApp
   - Escanear QR Code quando aparecer
   - Aguardar até **desconectar** OU no máximo **5 minutos**

6. **Observar logs no terminal:**
   - Procurar por mensagens `[wbot][DEBUG]`
   - Verificar eventos sendo registrados

7. **Localizar arquivo de log gerado:**
   ```bash
   ls -lah backend/logs/baileys-debug/
   ```
   O arquivo terá nome como: `baileys-debug-whatsapp-{id}-{numero}-YYYY-MM-DD_HH-mm-ss.log`

8. **Salvar uma cópia do log:**
   ```bash
   cp backend/logs/baileys-debug/baileys-debug-whatsapp-*.log ~/debug-numero-problema.log
   ```

9. **Anotar informações importantes:**
   - Tempo até desconectar
   - StatusCode do erro
   - Mensagem de erro
   - Se o número apareceu na lista de dispositivos vinculados do WhatsApp

---

## 📝 Passo 3: Testar com Número Funcional

### Objetivo:
Coletar os mesmos logs para um número que está funcionando corretamente.

### Como executar:

1. **Repetir TODOS os passos do Passo 2** com um número diferente que você sabe que funciona

2. **Salvar cópia deste log também:**
   ```bash
   cp backend/logs/baileys-debug/baileys-debug-whatsapp-*.log ~/debug-numero-ok.log
   ```

3. **Verificar que este número permanece conectado** por pelo menos 5 minutos

---

## 🔍 Passo 4: Comparação e Análise

### Objetivo:
Identificar diferenças entre os dois fluxos de conexão.

### Como fazer a comparação:

1. **Abrir os dois logs lado a lado:**
   ```bash
   # Opção 1: Usar diff
   diff ~/debug-numero-problema.log ~/debug-numero-ok.log
   
   # Opção 2: Usar código
   code --diff ~/debug-numero-problema.log ~/debug-numero-ok.log
   ```

2. **O que comparar:**

   - [ ] **Timing entre eventos**
     - Tempo de QR Code → Open
     - Tempo de Open → Close (se aplicável)
     - Duração total da conexão

   - [ ] **StatusCode dos erros**
     - 401/403 = device_removed
     - 428 = connection_terminated
     - 515 = restart_required
     - Outro?

   - [ ] **Presença de device_removed**
     - Verificar se aparece no log do número problema

   - [ ] **Keepalives**
     - Quantos foram enviados antes de desconectar?
     - Algum falhou?

   - [ ] **Credenciais**
     - MeId apareceu?
     - Flag `registered` está true ou false?
     - Houve mudanças nas credenciais após QR scan?

   - [ ] **Tipo de socket**
     - É "md" (multi-device) ou "legacy"?
     - Flag `userRegistered` está definida?

   - [ ] **Sequência de eventos**
     - Os eventos aconteceram na mesma ordem?
     - Algum evento está faltando no número problema?

3. **Criar documento com achados:**
   ```bash
   nano ANALISE_COMPARACAO.md
   ```

   Template:
   ```markdown
   # Análise Comparativa - [DATA]
   
   ## Número Problemático
   - WhatsApp ID: 
   - Número:
   - Arquivo de log:
   - Tempo até desconectar:
   - StatusCode do erro:
   - Erro: 
   
   ## Número Funcional
   - WhatsApp ID:
   - Número:
   - Arquivo de log:
   - Status: Conectado
   
   ## Diferenças Identificadas
   
   ### Timing
   - [ ] Problema desconecta mais rápido/devagar?
   - [ ] Timing:
   
   ### Credenciais
   - [ ] MeId: 
   - [ ] Registered: 
   - [ ] Diferenças: 
   
   ### Eventos
   - [ ] Eventos ausentes:
   - [ ] Ordem diferente:
   
   ### Keepalive
   - [ ] Problema enviou quantos?
   - [ ] OK enviou quantos?
   
   ## Hipótese da Causa Raiz
   
   
   ## Solução Proposta
   
   ```

---

## 🔧 Passo 5: Implementar Solução

### Aguardando análise do Passo 4

Após identificar a causa raiz, implementar correção baseada no problema específico.

### Possíveis soluções baseadas em problemas conhecidos:

#### Se for: Keepalive não funciona
**Sintoma:** Desconecta após ~60 segundos  
**Solução:** Verificar se `sendPresenceUpdate` está falhando

#### Se for: Flag `registered = false`
**Sintoma:** Conecta mas WhatsApp não reconhece  
**Solução:** Forçar registro adequado do dispositivo

#### Se for: device_removed muito rápido
**Sintoma:** Erro 401/403 logo após conectar  
**Solução:** Verificar se WhatsApp não está detectando comportamento suspeito

### Melhorias para o Usuário

Adicionar mensagens claras no frontend quando desconectar:
- Descrição amigável do erro
- Sugestões de ação
- Link para documentação (se necessário)

---

## 📝 Passo 6: Documentação Final

### Após solução implementada:

1. **Atualizar documentação do projeto:**
   - Adicionar seção sobre troubleshooting de conexões
   - Documentar mensagens de erro e suas causas

2. **Criar guia de troubleshooting:**
   - Como identificar problemas de conexão
   - Como usar os logs de debug
   - Soluções para problemas comuns

3. **Atualizar README.md se necessário**

4. **Gerar texto de commit:**
   ```
   fix(baileys): resolve conexão desconectando após QR Code
   
   - Implementado sistema de debug logging detalhado
   - Identificado problema: [DESCREVER CAUSA]
   - Solução: [DESCREVER SOLUÇÃO]
   - Adicionadas mensagens amigáveis ao usuário
   
   Closes #[NÚMERO_DA_ISSUE]
   ```

---

## 📁 Arquivos Modificados

### Criados:
- `backend/src/helpers/debugBaileysConnection.ts` (novo)
- `backend/logs/baileys-debug/` (diretório criado automaticamente)

### Modificados:
- `backend/src/libs/wbot.ts` (adicionados logs de debug)

### Nota sobre gitignore:
- A pasta `backend/logs/` pode estar no gitignore
- Os logs NÃO devem ser commitados
- Apenas o código de logging deve ser commitado

---

## 🎯 Critérios de Sucesso

- [ ] Logs completos capturados para número problemático
- [ ] Logs completos capturados para número funcional
- [ ] Diferença identificada entre os dois comportamentos
- [ ] Causa raiz do problema documentada
- [ ] Solução implementada e testada
- [ ] Número problemático agora permanece conectado
- [ ] Mensagens amigáveis implementadas no frontend
- [ ] Documentação atualizada

---

## 🔗 Referências

- **Baileys Documentation:** https://github.com/WhiskeySockets/Baileys
- **Arquivo principal:** `backend/src/libs/wbot.ts`
- **Serviço de inicialização:** `backend/src/services/WbotServices/StartWhatsAppSession.ts`
- **Helper de logs:** `backend/src/helpers/debugBaileysConnection.ts`

---

## 💡 Dicas Importantes

1. **Sempre testar em desenvolvimento primeiro**
2. **Não commitar arquivos de log**
3. **Salvar cópias dos logs antes de limpar**
4. **Anotar timing exato dos eventos**
5. **Verificar no WhatsApp Mobile se dispositivo aparece vinculado**
6. **Usar `npm run dev` no backend para ver logs em tempo real**
7. **Se precisar debug mais detalhado, aumentar nível de log do Baileys** (atualmente em "error")

---

## 🚀 Como Retomar Este Trabalho

Se você está retomando este trabalho em outro momento ou computador:

1. **Clone o repositório e checkout da branch:**
   ```bash
   git checkout debug/baileys-connection
   ```

2. **Verifique o status atual:**
   - Leia este arquivo
   - Verifique se Passo 1 foi concluído (arquivos criados)
   - Identifique qual passo você deve executar a seguir

3. **Continue do passo onde parou:**
   - Passo 2: Testar número problemático
   - Passo 3: Testar número funcional
   - Passo 4: Comparar logs
   - Passo 5: Implementar solução
   - Passo 6: Documentar

4. **Sempre compile antes de testar:**
   ```bash
   cd backend
   npm run build
   ```

---

**Próximo passo recomendado:** Executar Passo 2 - Testar com número problemático
