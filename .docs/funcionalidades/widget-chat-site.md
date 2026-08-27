# Widget Chat do Site - Documentação de Integração

Este documento descreve como integrar o widget de chat do site TaktChat em qualquer página web.

---

## Visão Geral

O widget de chat do site permite que visitantes de um site iniciem conversas diretamente através de um chat embutido, sem precisar sair da página. As conversas são criadas como tickets no TaktChat com `entrySource: "site_chat"`.

---

## Pré-requisitos

1. **Plano com `useSiteChat` habilitado**: O plano da empresa deve ter a funcionalidade "Chat do Site" ativada.
2. **Configuração de canal**: Configure a fila padrão, tag e mensagem de boas-vindas para o canal "Chat do site" em **Configurações > Canais de entrada**.
3. **Widget servido**: O arquivo `widget.js` deve estar acessível publicamente (servido pelo frontend ou CDN).

---

## Como Obter o Código de Integração

1. Acesse **Configurações > Widget Chat do Site** no TaktChat.
2. Escolha o método de autenticação:
   - **Company ID**: ID numérico da empresa (mais simples, mas menos seguro para uso público)
   - **Company Token**: Token de autenticação (recomendado para sites públicos)
3. O código de integração será gerado automaticamente.
4. Clique em **Copiar** para copiar o código.

---

## Integração Básica

### Método 1: Usando Company ID

```html
<script src="https://seu-dominio.com/widget.js" data-company-id="123"></script>
```

### Método 2: Usando Company Token (Recomendado)

```html
<script src="https://seu-dominio.com/widget.js" data-company-token="abc123xyz"></script>
```

### Método 2b: Em página externa – URL da API explícita

Quando o widget está em um site diferente do frontend do TaktChat, use `data-api-url` para indicar a URL da API:

```html
<script 
  src="https://seu-taktchat.com/widget.js" 
  data-company-token="abc123xyz"
  data-api-url="https://api.taktchat.com.br"
></script>
```

### Método 3: Configuração via JavaScript

```html
<script>
  window.TaktChatWidget = {
    companyId: 123,
    // ou
    companyToken: 'abc123xyz',
    apiUrl: 'https://api.taktchat.com.br' // opcional, detecta automaticamente
  };
</script>
<script src="https://seu-dominio.com/widget.js"></script>
```

---

## Opções de Personalização

O widget suporta personalização via atributos `data-*`:

```html
<script 
  src="https://seu-dominio.com/widget.js" 
  data-company-id="123"
  data-position="bottom-right"
  data-primary-color="#2563EB"
  data-button-text="💬"
  data-button-size="60px"
></script>
```

### Atributos Disponíveis

- `data-company-id`: ID numérico da empresa (obrigatório se não usar token)
- `data-company-token`: Token de autenticação da empresa (obrigatório se não usar ID). Para obter: Configurações > Widget Chat do Site > "Obter token"
- `data-api-url`: URL da API do TaktChat (obrigatório em páginas externas onde o widget é hospedado em outro domínio)
- `data-position`: Posição do botão (`bottom-right`, `bottom-left`, `top-right`, `top-left`) - padrão: `bottom-right`
- `data-primary-color`: Cor principal do widget (hex) - padrão: `#2563EB`
- `data-button-text`: Texto/emoji do botão - padrão: `💬`
- `data-button-size`: Tamanho do botão (ex: `60px`) - padrão: `60px`

---

## Como Funciona

### Fluxo de Uso

1. **Visitante acessa o site**: O widget carrega automaticamente e exibe um botão flutuante.
2. **Visitante clica no botão**: Uma janela de chat é aberta.
3. **Formulário inicial**: O visitante preenche nome, e-mail, telefone (opcional) e mensagem inicial (opcional).
4. **Criação do ticket**: Ao enviar o formulário:
   - Um contato é criado ou atualizado (merge conservador)
   - Um ticket é criado com `entrySource: "site_chat"`
   - Se houver mensagem inicial, ela é registrada como primeira mensagem
   - A mensagem de boas-vindas configurada é enviada (se configurada)
5. **Chat ativo**: O visitante pode enviar e receber mensagens em tempo real (polling a cada 3 segundos).

### Reutilização de Tickets

- Se o visitante já tiver um ticket aberto com `entrySource: "site_chat"` para o mesmo contato e WhatsApp, o ticket existente é reutilizado.
- Isso evita criar múltiplos tickets para o mesmo visitante.

---

## API Pública do Widget

O widget utiliza os seguintes endpoints da API pública:

### POST `/public/site-chat/submit`

Cria um novo ticket ou reutiliza um existente.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11999999999",
  "message": "Olá, preciso de ajuda",
  "companyId": 123
}
```

**Response:**
```json
{
  "ticketId": 456,
  "contactId": 789,
  "token": "uuid-do-ticket"
}
```

### POST `/public/site-chat/message`

Envia uma mensagem no ticket.

**Request:**
```json
{
  "ticketId": 456,
  "body": "Minha mensagem"
}
```

**Response:**
```json
{
  "id": 123,
  "body": "Minha mensagem",
  "fromMe": false,
  "createdAt": "2026-02-11T10:00:00Z"
}
```

### GET `/public/site-chat/messages`

Busca mensagens do ticket.

**Query Parameters:**
- `ticketId`: ID do ticket (ou `token` como alternativa)
- `token`: UUID do ticket (ou `ticketId` como alternativa)

**Response:**
```json
[
  {
    "id": 123,
    "body": "Olá! Como posso ajudar?",
    "fromMe": true,
    "createdAt": "2026-02-11T10:00:00Z"
  },
  {
    "id": 124,
    "body": "Preciso de ajuda com o produto",
    "fromMe": false,
    "createdAt": "2026-02-11T10:01:00Z"
  }
]
```

---

## Rate Limiting

Os endpoints públicos têm rate limiting:
- **20 requisições por IP a cada minuto**

Se o limite for excedido, o widget exibirá uma mensagem de erro.

---

## API Pública do Widget (JavaScript)

O widget expõe uma API pública que pode ser usada programaticamente:

```javascript
// Abrir o widget
window.TaktChatWidgetAPI.open();

// Fechar o widget
window.TaktChatWidgetAPI.close();

// Enviar mensagem programaticamente
window.TaktChatWidgetAPI.sendMessage();
```

---

## Exemplo Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site</title>
</head>
<body>
  <h1>Bem-vindo ao Meu Site</h1>
  <p>Conteúdo do site...</p>

  <!-- Widget Chat do Site -->
  <script 
    src="https://seu-dominio.com/widget.js" 
    data-company-token="seu-token-aqui"
    data-primary-color="#2563EB"
  ></script>
</body>
</html>
```

---

## Troubleshooting

### Widget não aparece

1. Verifique se o arquivo `widget.js` está acessível na URL configurada.
2. Verifique se o plano tem `useSiteChat` habilitado.
3. Verifique o console do navegador para erros JavaScript.

### Erro "Chat do site não disponível no seu plano"

- Acesse **Configurações > Planos** e habilite a opção "Chat do Site" no plano da empresa.

### Erro "Token de empresa inválido"

- Verifique se o `companyToken` está correto.
- Se estiver usando `companyId`, verifique se o ID está correto.

### Mensagens não aparecem

- Verifique se há um atendente online e se o ticket foi atribuído a uma fila.
- Verifique se o polling está funcionando (o widget busca mensagens a cada 3 segundos).

---

## Segurança

- **Company Token**: Recomendado para sites públicos, pois não expõe o ID numérico da empresa.
- **HTTPS**: Sempre use HTTPS em produção para proteger as comunicações.
- **CORS**: A API pública permite requisições de qualquer origem. Em produção, considere restringir por domínio se necessário.

---

## Empilhamento com o FAB da vitrine

Na landing (`/landing`, `/landing/v1`), no tour e no login, o FAB **Falar no WhatsApp** e o botão `#taktchat-widget-button` compartilham o canto inferior direito.

- O frontend define `--taktchat-site-chat-bottom` e `--taktchat-site-chat-panel-bottom` no `documentElement`.
- `widget.js` posiciona o botão com `bottom: calc(var(--taktchat-site-chat-bottom, 20px) + env(safe-area-inset-bottom, 0px))`.
- Ordem: banner de cookies (se visível) → FAB WhatsApp → chat do site acima do FAB.
- Se o chat do site não estiver habilitado nas settings, só o FAB aparece.

---

## Personalização Avançada

O widget pode ser personalizado via CSS customizado (usando `!important` para sobrescrever estilos padrão):

```css
/* Exemplo: Personalizar cor do botão */
#taktchat-widget-button {
  background: #ff0000 !important;
}
```

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação da API: `/public/site-chat/*`
- Configurações do canal: **Configurações > Canais de entrada > Chat do site**
- Logs do backend para debug
