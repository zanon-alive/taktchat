# 🚀 PLANO DE AÇÃO: Integração WhatsApp Business API Oficial

> **Plano histórico.** A implementação evoluiu desde este snapshot; prazos, bibliotecas, preços e afirmações comerciais não são vigentes. Consulte [../whatsapp-api-oficial.md](../whatsapp-api-oficial.md).

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Análise da Arquitetura Atual](#análise)
3. [Opções de Bibliotecas](#bibliotecas)
4. [Plano de Implementação](#implementação)
5. [Cronograma e Recursos](#cronograma)

---

## 🎯 Visão Geral

### Objetivo
Adicionar **WhatsApp Business API Oficial** como novo canal, mantendo Baileys.

### Benefícios
- ✅ **Canal oficial**: sujeito aos contratos, limites e políticas vigentes da Meta
- ✅ **Escalabilidade**: Alto volume de mensagens
- ✅ **Recursos Avançados**: Templates, botões, listas
- ✅ **Webhooks**: Eventos em tempo real
- ✅ **Multi-agente**: Vários atendentes simultâneos

---

## 🔍 Análise da Arquitetura Atual {#análise}

### Estrutura Identificada
```
✅ Campo 'channel' já existe no modelo Whatsapp (linha 129)
✅ Campo 'token' já existe (linha 114)
✅ Arquitetura modular pronta para extensão
```

### Arquivos Principais
- `backend/src/libs/wbot.ts` - Inicialização Baileys
- `backend/src/services/WbotServices/wbotMessageListener.ts` - Eventos
- `backend/src/services/MessageServices/SendWhatsAppMessage.ts` - Envio

---

## 📚 Opções de Bibliotecas {#bibliotecas}

### 🥇 Recomendada: whatsapp-business-api
```bash
npm install whatsapp-business-api
```
**Prós:** Oficial Meta, TypeScript, webhooks  
**Contras:** Requer conta Business verificada, custos por mensagem

### 🥈 Alternativa: @green-api/whatsapp-api-client
```bash
npm install @green-api/whatsapp-api-client
```
**Prós:** Simplificada, docs em PT-BR  
**Contras:** Serviço terceiro, custos mensais

### 🥉 Custom: Axios direto
**Prós:** Controle total, sem lock-in  
**Contras:** Mais trabalho de desenvolvimento

---

## 🚀 Plano de Implementação {#implementação}

### FASE 1: Preparação (2-3 dias)
**1.1 Adicionar Campos ao Modelo**

```typescript
// backend/src/models/Whatsapp.ts
@Column
channelType: string; // "baileys" | "official"

@Column(DataType.TEXT)
wabaPhoneNumberId: string;

@Column(DataType.TEXT)
wabaAccessToken: string;

@Column(DataType.TEXT)
wabaBusinessAccountId: string;
```

**1.2 Criar Migration**
```bash
cd backend
npm run db:migrate
```

---

### FASE 2: Camada de Abstração (3-4 dias)
**2.1 Interface Unificada**

```typescript
// backend/src/libs/whatsapp/IWhatsAppAdapter.ts
export interface IWhatsAppAdapter {
  initialize(): Promise<void>;
  sendMessage(options: ISendMessageOptions): Promise<IWhatsAppMessage>;
  onMessage(callback: (msg: IWhatsAppMessage) => void): void;
  getConnectionStatus(): "connected" | "disconnected" | "connecting";
}
```

**2.2 Adapters**
- `BaileysAdapter.ts` - Wrapper para Baileys existente
- `OfficialAPIAdapter.ts` - Cliente API oficial
- `WhatsAppFactory.ts` - Factory pattern

---

### FASE 3: Implementar API Oficial (4-5 dias)
**3.1 Cliente REST**
```typescript
// Axios para chamadas à Graph API do Facebook
const client = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

**3.2 Métodos Principais**
- `sendTextMessage()`
- `sendMediaMessage()`
- `sendTemplate()`
- `sendInteractiveButtons()`
- `sendInteractiveList()`

---

### FASE 4: Sistema de Webhooks (3 dias)
**4.1 Endpoint de Webhooks**

```typescript
// backend/src/routes/webhookRoutes.ts
router.get('/webhooks/whatsapp', webhookVerify);
router.post('/webhooks/whatsapp', webhookHandler);
```

**4.2 Processar Eventos**
- Mensagens recebidas
- Status de entrega
- Leitura de mensagens
- Mudanças de status

---

### FASE 5: Adaptar Services (4-5 dias)
**5.1 SendWhatsAppMessage**
```typescript
const adapter = await WhatsAppFactory.createAdapter(whatsapp);
await adapter.sendMessage({ to, body, mediaType });
```

**5.2 CreateMessageService**
- Suportar ambos os canais
- Normalizar formato de mensagens

---

### FASE 6: Interface Frontend (3-4 dias)
**6.1 Modal de Configuração**
- Seletor de canal (Baileys/Official)
- Campos de credenciais WABA
- Teste de conexão

**6.2 Dashboard**
- Status de cada canal
- Indicadores de saúde
- Métricas de uso

---

### FASE 7: Testes (2-3 dias)
- ✅ Envio/recebimento de mensagens
- ✅ Troca entre canais
- ✅ Webhooks em produção
- ✅ Stress test

---

### FASE 8: Documentação (2 dias)
- Manual de configuração
- Troubleshooting
- Comparativo Baileys vs Official

---

## ⏱️ Cronograma e Recursos {#cronograma}

### Tempo Total Estimado
**25-30 dias úteis** (1-1.5 meses)

### Recursos Necessários
- **1 Desenvolvedor Backend** (principal)
- **1 Desenvolvedor Frontend** (suporte)
- **1 DevOps** (webhooks e infra)

### Custos Meta (Brasil 2024)
- Conversas de marketing: R$ 0,34
- Conversas de serviço: R$ 0,17
- Autenticação: Gratuita

---

## ✅ Checklist de Progresso

### Preparação
- [ ] Migration criada e executada
- [ ] Modelo atualizado
- [ ] Ambiente de teste configurado

### Desenvolvimento
- [ ] Interface IWhatsAppAdapter criada
- [ ] BaileysAdapter implementado
- [ ] OfficialAPIAdapter implementado
- [ ] WhatsAppFactory implementado
- [ ] Webhooks configurados
- [ ] Services adaptados

### Frontend
- [ ] Modal de configuração
- [ ] Seletor de canal
- [ ] Testes de UI

### Testes
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes em produção

### Documentação
- [ ] Manual de configuração
- [ ] Guia de migração
- [ ] Troubleshooting

---

## 📞 Próximos Passos

### Imediato (Esta Semana)
1. ✅ Revisar e aprovar este plano
2. ✅ Decidir biblioteca (recomendo whatsapp-business-api)
3. ✅ Criar conta no Meta Business (se não tiver)
4. ✅ Iniciar FASE 1 (preparação)

### Semana 1-2
- Implementar FASE 1 e 2 (modelo + abstração)
- Configurar ambiente de testes

### Semana 3-4
- Implementar FASE 3 e 4 (API + webhooks)
- Testes iniciais

---

## 🤔 Decisões Necessárias

### 1. Qual biblioteca usar?
- [ ] whatsapp-business-api (oficial Meta)
- [ ] @green-api/whatsapp-api-client (terceiro)
- [ ] Custom com Axios

**Recomendação:** whatsapp-business-api

### 2. Manter Baileys como padrão?
- [ ] Sim, manter Baileys como padrão
- [ ] Não, migrar para Official

**Recomendação:** Sim, oferecer ambos

### 3. Suporte a migração automática?
- [ ] Sim, migrar conexões Baileys → Official
- [ ] Não, apenas novos canais

---

## 📝 Observações Finais

Este plano é **modular e incremental**, permitindo ajustes conforme avançamos. 

Podemos começar com **MVP simplificado** (apenas envio/recebimento de texto) e depois adicionar recursos avançados (templates, botões, listas).

**Próximo passo sugerido:** Criar branch `feature/whatsapp-official-api` e iniciar FASE 1.
