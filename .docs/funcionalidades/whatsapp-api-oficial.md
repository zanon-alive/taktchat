# WhatsApp Business API Oficial

> Guia canônico: pasta [whatsapp-api-oficial/](whatsapp-api-oficial/index.md). Este arquivo é um resumo.

**Versão:** 1.0  
**Data:** 2025-01-27  
**Status:** ✅ Implementado (Backend e Frontend). Deploy da VPS segue `14_taktchat.yml` (volumes), independente deste canal.

---

## 📋 Visão Geral

A integração da **WhatsApp Business API Oficial da Meta** permite que o TaktChat ofereça um canal profissional, escalável e confiável para comunicação via WhatsApp, mantendo total compatibilidade com Baileys (conexão não oficial).

### Dual Channel Support

O TaktChat suporta **simultaneamente** dois canais de WhatsApp:

1. **Baileys** (não oficial, gratuito)
   - Conexão via QR Code
   - Ideal para empresas pequenas
   - Até 150-500 mensagens/dia (com anti-ban)

2. **WhatsApp Business API Oficial** (Meta, pago, profissional)
   - Conexão via credenciais Meta
   - Ideal para empresas médias/grandes
   - Volume ilimitado (dentro dos limites de cobrança)
   - Sem risco de banimento
   - Uptime 99.9%

---

## 🎯 Benefícios Principais

### ✅ Confiabilidade Empresarial
- SLA garantido pela Meta
- Sem risco de banimento
- Uptime 99.9%

### 📈 Escalabilidade
- Suporte a milhares de conversas simultâneas
- Multi-agente nativo
- Rate limit de 80 msg/segundo

### 🚀 Recursos Avançados
- Templates aprovados (marketing)
- Botões e listas interativas
- Webhooks em tempo real
- Analytics oficiais

### 💰 Modelo de Negócio
- Diferencial competitivo
- Novo público-alvo (empresas maiores)
- Potencial de upsell

---

## 📊 Comparativo: Baileys vs API Oficial

| Aspecto | Baileys | API Oficial |
|---------|---------|-------------|
| **Setup** | QR Code (2 min) | Credenciais Meta (30 min) |
| **Custo** | R$ 0 | R$ 0,17-0,34/conversa* |
| **Banimento** | Risco moderado | Sem risco |
| **Limite msg/dia** | ~150-500** | Ilimitado |
| **Multi-agente** | Problemático | Nativo |
| **Templates** | ❌ | ✅ |
| **Botões interativos** | Limitado | Completo |
| **Webhooks** | ❌ | ✅ |
| **SLA/Suporte** | Comunidade | Meta oficial |
| **Uptime** | ~95% | 99.9% |

*\* Primeiras 1.000 conversas/mês grátis*  
*\*\* Com anti-ban configurado*

---

## 🏗️ Arquitetura

### Padrão de Design: Adapter Pattern + Factory Pattern

```
Frontend (React)
    ↓
Backend API (TypeScript)
    ↓
WhatsAppFactory (Factory Pattern)
    ↓
    ├─ BaileysAdapter ────→ Baileys (WebSocket + QR Code)
    └─ OfficialAPIAdapter ─→ Meta Graph API (REST + Webhooks)
           ↑
           └─ Webhooks (POST /webhooks/whatsapp)
```

### Componentes Principais

1. **IWhatsAppAdapter** - Interface unificada que define contrato comum
2. **BaileysAdapter** - Implementação Baileys (já existente)
3. **OfficialAPIAdapter** - Implementação API Oficial (NOVO)
4. **WhatsAppFactory** - Factory para criar adapters automaticamente
5. **ProcessWhatsAppWebhook** - Processamento de webhooks da Meta

---

## 📖 Documentação Completa

Para documentação detalhada, consulte:

📘 **[Documentação Principal](../funcionalidades/whatsapp-api-oficial/index.md)**

Inclui:
- ⚡ Quick Start (30 minutos)
- 📚 Tutorial completo de integração Meta
- 📋 Plano técnico detalhado
- 📊 Status da implementação
- 🔧 Guias de configuração

---

## 🚀 Como Começar

### Opção 1: Quick Start (30 minutos)

Siga o guia rápido para configuração em 30 minutos:
📖 [Quick Start](../funcionalidades/whatsapp-api-oficial/WHATSAPP_API_QUICKSTART.md)

### Opção 2: Tutorial Completo

Para configuração detalhada passo a passo:
📚 [Tutorial de Integração Meta](../funcionalidades/whatsapp-api-oficial/tutorial-integracao-meta.md)

---

## 💰 Análise de Custos

### Meta (Brasil 2024)

- **Conversas de Serviço**: R$ 0,17 cada
- **Conversas de Marketing**: R$ 0,34 cada
- **Autenticação**: Gratuito
- **1.000 primeiras conversas/mês**: GRÁTIS

### Exemplos Práticos

#### Empresa Pequena (50 conversas/dia)
- **Custo mensal**: R$ 0 (dentro do free tier)
- **Economia**: Sem custos de banimento

#### Empresa Média (200 conversas/dia)
- **Total mês**: ~6.000 conversas
- **Custo**: (6.000 - 1.000) × R$ 0,17 = **R$ 850/mês**
- **Benefício**: Escalabilidade + Confiabilidade

#### Empresa Grande (1.000 conversas/dia)
- **Total mês**: ~30.000 conversas
- **Custo**: (30.000 - 1.000) × R$ 0,17 = **R$ 4.930/mês**
- **ROI**: Economia de tempo operacional + Zero banimentos

---

## 🎯 Casos de Uso

### Cenário 1: E-commerce
**Necessidade:** Enviar confirmações de pedido, tracking, promoções
- ✅ Templates aprovados para marketing
- ✅ Botões para ações rápidas
- ✅ Alto volume (milhares/dia)
- **Solução:** API Oficial

### Cenário 2: Suporte Técnico
**Necessidade:** Múltiplos atendentes, SLA garantido
- ✅ Multi-agente nativo
- ✅ Webhooks para notificações
- ✅ Confiabilidade 99.9%
- **Solução:** API Oficial

### Cenário 3: Pequena Empresa
**Necessidade:** Baixo volume, custo zero
- ✅ Até 150 mensagens/dia
- ✅ Atendimento humanizado
- ✅ Sem custo de mensagens
- **Solução:** Baileys (mantém atual)

### Cenário 4: Startup Escalando
**Necessidade:** Crescimento rápido, evitar banimentos
- ✅ Free tier (1.000 conversas/mês)
- ✅ Escala conforme cresce
- ✅ Migração gradual Baileys → Oficial
- **Solução:** Híbrido (ambos)

---

## 🔧 Configuração

### Variáveis de Ambiente

Veja o arquivo de exemplo completo:
📄 [whatsapp-api-oficial.env.example](../configuracao/whatsapp-api-oficial.env.example)

Variáveis necessárias:

```env
WABA_PHONE_NUMBER_ID=          # Phone Number ID da Meta
WABA_ACCESS_TOKEN=             # Access Token da Meta
WABA_BUSINESS_ACCOUNT_ID=      # Business Account ID
WABA_WEBHOOK_VERIFY_TOKEN=     # Token para verificar webhook
WABA_WEBHOOK_URL=              # URL pública do webhook (HTTPS obrigatório)
```

### Configuração no Frontend

1. Acesse **Conexões** no menu
2. Clique em **Nova Conexão**
3. Selecione **"API Oficial"** como tipo de canal
4. Preencha as credenciais da Meta
5. A URL do webhook será exibida automaticamente
6. Configure o webhook na Meta Business usando essa URL

---

## 🔄 Migração de Baileys para API Oficial

### Processo Recomendado

1. **Criar nova conexão API Oficial** (sem deletar Baileys)
2. **Testar em paralelo** com Baileys
3. **Migrar gradualmente** conforme confiança aumenta
4. **Manter ambos** se necessário (suporte simultâneo)
5. **Desativar Baileys** apenas quando API Oficial estiver 100% validada

### Vantagens da Migração Gradual

- ✅ Teste sem risco
- ✅ Zero downtime
- ✅ Fallback automático (Baileys)
- ✅ Validação completa antes de migrar tudo

---

## 📊 Status da Implementação

### ✅ Concluído (75%)

- [x] Backend completo (100%)
  - [x] Camada de abstração (Adapter Pattern)
  - [x] Factory Pattern
  - [x] OfficialAPIAdapter implementado
  - [x] Sistema de webhooks
  - [x] Integração com serviços existentes
  
- [x] Frontend completo (100%)
  - [x] Seletor de tipo de canal
  - [x] Formulário específico API Oficial
  - [x] Validações Yup
  - [x] Badges visuais
  - [x] URL do webhook dinâmica
  
- [x] Documentação completa (100%)
  - [x] Quick Start
  - [x] Tutorial completo
  - [x] Plano técnico
  - [x] Guias de configuração

### ⏳ Pendente

- [ ] Testes finais (0%)
- [ ] Deploy em produção (0%)
- [ ] Monitoramento (0%)

**Progresso Total: 75%**

---

## 🔍 Troubleshooting

### Problemas Comuns

#### Conexão não conecta
- ✅ Verificar credenciais Meta
- ✅ Validar Phone Number ID
- ✅ Verificar Access Token válido
- ✅ Confirmar Business Account ID

#### Webhook não funciona
- ✅ Verificar se URL é HTTPS (obrigatório)
- ✅ Validar Verify Token
- ✅ Confirmar URL pública acessível
- ✅ Verificar logs do backend

#### Mensagens não enviam
- ✅ Verificar status da conexão
- ✅ Validar formato do número
- ✅ Confirmar limites da conta Meta
- ✅ Verificar logs de erro

Para mais detalhes, consulte:
- 📖 [Tutorial completo](../funcionalidades/whatsapp-api-oficial/tutorial-integracao-meta.md)
- 🔧 [Configuração](../configuracao/)
- 🐛 [Troubleshooting](../operacao/troubleshooting.md)

---

## 📚 Referências Técnicas

### Arquivos do Código

- **Interface Adapter:** `backend/src/libs/whatsapp/IWhatsAppAdapter.ts`
- **BaileysAdapter:** `backend/src/libs/whatsapp/BaileysAdapter.ts`
- **OfficialAPIAdapter:** `backend/src/libs/whatsapp/OfficialAPIAdapter.ts`
- **Factory:** `backend/src/libs/whatsapp/WhatsAppFactory.ts`
- **Webhook Controller:** `backend/src/controllers/WhatsAppWebhookController.ts`
- **Webhook Service:** `backend/src/services/WbotServices/ProcessWhatsAppWebhook.ts`

### Documentação Externa

- **Meta Developers:** https://developers.facebook.com/docs/whatsapp
- **Pricing:** https://developers.facebook.com/docs/whatsapp/pricing
- **API Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference

---

## ✅ Conclusão

A **WhatsApp Business API Oficial** está implementada e pronta para uso, oferecendo:

- ✅ Dual channel (Baileys + Oficial)
- ✅ Zero breaking changes
- ✅ Arquitetura extensível
- ✅ Interface visual completa
- ✅ Documentação profissional

**Próximos passos:** Testes em ambiente de staging antes do deploy em produção.

---

**Última atualização:** 2025-01-27  
**Documentação:** `.docs/funcionalidades/whatsapp-api-oficial/`

