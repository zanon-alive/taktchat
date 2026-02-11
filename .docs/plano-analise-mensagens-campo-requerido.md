# Plano: Análise de Mensagens "Campo Requerido" em Inglês

## Status: Implementado ✅

A implementação foi concluída. Mensagens de validação de campos obrigatórios passaram a usar i18n (namespace `validation` em pt, en, es, tr). Formulários Formik receberam `noValidate` para evitar a mensagem nativa do navegador em inglês. Detalhes em `.docs/anexos/notas-de-versao.md`.

---

## Problema

Em algumas telas do sistema, a mensagem de validação para campos obrigatórios aparece em inglês ("Required", "Please fill out this field.") mesmo quando o idioma está configurado em pt-BR.

## Origens identificadas

### 1. Yup `.required("Required")` – mensagem hardcoded em inglês

A mensagem "Required" aparece quando a validação do Formik/Yup é disparada e o schema usa `.required("Required")` sem i18n.

**Arquivos com `.required("Required")` (15 ocorrências):**

| Arquivo | Campos |
|---------|--------|
| `ContactForm/index.js` | name |
| `ContactListItemModal/index.js` | name |
| `ContactListDialog/index.js` | name |
| `ContactNotesDialog/index.js` | note |
| `ContactNotes/index.js` | note |
| `ModalUsers/index.js` | name, email |
| `UserModal/index.js` | name, email |
| `FlowBuilderAddTypebotModal/index.js` | name |
| `QueueIntegrationModal/index.js` | projectName, jsonContent, name (3x) |
| `QueueModal/index.js` | name, name (n8n) |
| `WhatsAppModal/index.js` | name |
| `WhatsAppModalAdmin/index.js` | name |
| `CampaignModal/index.js` | name |
| `ChatBots/options.js` | name |

### 2. Mensagem nativa do navegador: "Please fill out this field."

Essa mensagem vem da validação HTML5 nativa do navegador quando:

- O input tem o atributo `required` (ou `required={true}` no React)
- O formulário **não** tem `noValidate`
- O submit é feito antes (ou em paralelo) da validação do Formik

O Formik renderiza um `<form>` padrão. Se o form não tiver `noValidate`, o navegador valida antes do Formik e exibe a mensagem nativa, geralmente em inglês independente do idioma da página.

**Inputs com `required` identificados em vários componentes:**
- FlowBuilderAddQuestionModal, FlowBuilderAddTypebotModal
- CompaniesModal, ContactListDialog
- PromptModal, QueueIntegrationModal
- Signup, FlowBuilderAddOpenAIModal
- E outros com `required` ou `required={condição}`

### 3. checkoutFormModel.js – mistura pt-BR e inglês

O arquivo `frontend/src/components/CheckoutPage/FormModel/checkoutFormModel.js` contém:

- `lastName`: label e `requiredErrorMsg` em inglês
- `useAddressForPaymentDetails`: label em inglês
- `nameOnCard`, `cardNumber`, `expiryDate`, `cvv`: labels e mensagens em inglês

### 4. Outras mensagens em inglês

- `"too short"` em QueueModal (linha 123) e ChatBots/options.js (linha 33)
- `LeadForm.js`: `countryCode: Yup.string().required()` – sem mensagem personalizada (Yup usa padrão)
- Yup `.required()` sem argumento – mensagem padrão do Yup

## Estratégia de análise e correção

### Fase 1: Inventário completo

1. Buscar todos os usos de `.required()` no código (com e sem mensagem)
2. Buscar todos os usos do atributo `required` em TextField, Field, Input
3. Verificar se os forms Formik usam `noValidate`
4. Listar mensagens de validação hardcoded em cada tela

### Fase 2: Padronização i18n

1. Criar namespace `validation` (ou similar) em `pt.js`, `en.js`, `es.js`, `tr.js`:
   - `validation.required`: "Campo obrigatório" / "Required" / etc.
   - `validation.tooShort`: "Muito curto" / "Too short" / etc.
   - `validation.emailInvalid`: "E-mail inválido" / "Invalid email" / etc.
2. Substituir strings hardcoded por `i18n.t("validation.xxx")` nos schemas Yup

### Fase 3: HTML5 vs Formik

1. Avaliar adicionar `noValidate` no componente Form do Formik (via `component` ou wrapper) para desativar a validação HTML5 nativa e depender apenas da validação Formik/Yup (já internacionalizada)
2. Alternativa: manter `required` para acessibilidade, mas garantir que o form tenha `noValidate` para evitar a mensagem nativa em inglês

### Fase 4: Telas prioritárias

| Grupo | Telas/Componentes | Prioridade |
|-------|-------------------|------------|
| Autenticação | Login, Signup, ForgetPassword, ResetPassword | Alta |
| Contatos | ContactForm, ContactModal, ContactListItemModal | Alta |
| Usuários/empresas | UserModal, ModalUsers, CompaniesModal | Alta |
| Filas/Integrações | QueueModal, QueueIntegrationModal, WebhookModal | Alta |
| Campanhas | CampaignModal | Média |
| FlowBuilder | FlowBuilderAddTypebotModal, AddQuestionModal, etc. | Média |
| Checkout | CheckoutPage, checkoutFormModel | Média |
| Configurações | WhatsAppModal, WhatsAppModalAdmin, Settings | Média |

### Fase 5: Checkout e formulários específicos

1. Traduzir checkoutFormModel para pt-BR (ou usar i18n)
2. Revisar LeadForm e outros formulários da Landing Page

## Validação

- Trocar idioma para pt-BR e testar formulários em cada tela
- Verificar que não aparecem mais "Required" nem "Please fill out this field."
- Verificar que as mensagens em pt-BR aparecem corretamente

## Ordem sugerida

1. Criar chaves de validação em `pt.js`, `en.js`, `es.js`, `tr.js`
2. Substituir `.required("Required")` por `.required(i18n.t("validation.required"))` em todos os arquivos
3. Avaliar e aplicar `noValidate` nos forms Formik
4. Corrigir checkoutFormModel e demais hardcoded
5. Testar fluxos principais em pt-BR
