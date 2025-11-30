# Otimização do Sistema de Reconexão Baileys

## Problema Identificado

O sistema estava tentando reconectar indefinidamente em vários cenários, mesmo quando não fazia sentido:

1. **Erro 401/403 (device_removed)**: Tentava reconectar automaticamente, mas o WhatsApp requer um novo QR Code manual.
2. **Desconexões genéricas**: Tentava reconectar infinitamente a cada 5 segundos.
3. **Logout intencional**: Tentava reconectar após 10 segundos, mesmo quando o usuário desconectou propositalmente.

## Solução Implementada

### 1. Controle de Tentativas de Reconexão

Criado um mapa `reconnectionAttemptsMap` que rastreia:
- Número de tentativas de reconexão por WhatsApp
- Data da última tentativa
- Limite máximo: **3 tentativas**

```typescript
const reconnectionAttemptsMap = new Map<number, {
  count: number;
  lastAttempt: Date;
}>();

const MAX_RECONNECTION_ATTEMPTS = 3;
```

### 2. Comportamento por Tipo de Erro

#### Erro 401/403 (device_removed)
- **ANTES**: Tentava reconectar e gerar QR Code automaticamente
- **AGORA**: 
  - Limpa as credenciais
  - Altera status para `PENDING`
  - **NÃO reconecta automaticamente**
  - Usuário deve clicar em "Novo QR" na interface

#### Desconexões Genéricas
- **ANTES**: Reconectava infinitamente a cada 5 segundos
- **AGORA**:
  - Máximo de 3 tentativas
  - Delay progressivo: 5s → 10s → 15s
  - Após 3 tentativas, para e altera status para `DISCONNECTED`
  - Usuário deve clicar em "Tentar Novamente"
  - Contador reseta após 5 minutos de inatividade

#### Logout Intencional
- **ANTES**: Tentava reconectar após 10 segundos
- **AGORA**:
  - **NÃO reconecta automaticamente**
  - Respeita a ação do usuário
  - Limpa contador de tentativas

#### Conexão Bem-Sucedida
- Reseta o contador de tentativas
- Permite novas tentativas futuras se necessário

### 3. Logs Melhorados

Agora o sistema informa claramente:
```
[wbot] Tentativa de reconexão 1/3 para whatsappId=4
[wbot] Aguardando 5s antes de reconectar...
```

```
[wbot] ⚠️ Máximo de 3 tentativas de reconexão atingido para whatsappId=4
[wbot] ⚠️ Parando reconexões automáticas. Use o botão 'Tentar Novamente' na interface.
```

```
[wbot] ⚠️ Device removido. Aguardando ação manual do usuário para gerar novo QR Code.
[wbot] ⚠️ Status alterado para PENDING. Use o botão 'Novo QR' na interface para reconectar.
```

## Benefícios

1. **Redução de Carga**: Evita loops infinitos de reconexão
2. **Melhor UX**: Usuário sabe quando precisa agir manualmente
3. **Logs Claros**: Fácil identificar o que está acontecendo
4. **Respeita Intenção**: Não reconecta quando o usuário desconectou propositalmente
5. **Economia de Recursos**: Menos requisições desnecessárias ao WhatsApp

## Como Testar

1. **Teste de device_removed**:
   - Conecte um número
   - Remova o dispositivo no WhatsApp Mobile
   - Verifique que o sistema NÃO tenta reconectar automaticamente
   - Status deve ficar em `PENDING`

2. **Teste de reconexão limitada**:
   - Force uma desconexão (ex: desligar internet)
   - Observe as 3 tentativas com delays progressivos
   - Após 3 tentativas, status deve ficar `DISCONNECTED`

3. **Teste de logout intencional**:
   - Clique em "Desconectar" na interface
   - Verifique que NÃO reconecta automaticamente

4. **Teste de conexão bem-sucedida**:
   - Após reconectar com sucesso
   - Contador deve ser resetado
   - Novas desconexões terão 3 tentativas novamente
