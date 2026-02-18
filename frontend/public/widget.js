/**
 * TaktChat Site Chat Widget
 * Widget JavaScript standalone para integração do chat do site
 * 
 * Uso:
 * <script src="https://seu-dominio.com/widget.js" data-company-id="123" data-company-token="abc123"></script>
 * 
 * Ou via configuração:
 * <script>
 *   window.TaktChatWidget = {
 *     companyId: 123,
 *     companyToken: 'abc123',
 *     apiUrl: 'https://api.taktchat.com.br'
 *   };
 * </script>
 * <script src="https://seu-dominio.com/widget.js"></script>
 */

(function() {
  'use strict';

  // Configuração padrão
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
    primaryColor: '#2563EB',
    buttonText: '💬',
    buttonSize: '60px',
    zIndex: 9999,
    pollInterval: 3000 // 3 segundos
  };

  // Detectar URL da API (prioridade: data-api-url > window.TaktChatWidget > origem do script)
  function getApiUrl() {
    const script = document.querySelector('script[src*="widget.js"]');
    const dataApiUrl = script?.getAttribute('data-api-url');
    if (dataApiUrl) {
      return dataApiUrl.replace(/\/$/, ''); // Remove barra final
    }
    if (window.TaktChatWidget?.apiUrl) {
      return window.TaktChatWidget.apiUrl.replace(/\/$/, '');
    }
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.includes('widget.js')) {
        const url = new URL(src);
        return `${url.protocol}//${url.host}`;
      }
    }
    return window.location.origin;
  }

  // Obter configuração
  function getConfig() {
    const script = document.querySelector('script[src*="widget.js"]');
    const dataAttrs = script ? {
      companyId: script.getAttribute('data-company-id'),
      companyToken: script.getAttribute('data-company-token'),
      position: script.getAttribute('data-position') || DEFAULT_CONFIG.position,
      primaryColor: script.getAttribute('data-primary-color') || DEFAULT_CONFIG.primaryColor,
      buttonText: script.getAttribute('data-button-text') || DEFAULT_CONFIG.buttonText,
      buttonSize: script.getAttribute('data-button-size') || DEFAULT_CONFIG.buttonSize
    } : {};

    return {
      ...DEFAULT_CONFIG,
      ...window.TaktChatWidget,
      ...dataAttrs,
      apiUrl: getApiUrl()
    };
  }

  // Estado do widget
  let state = {
    config: null,
    isOpen: false,
    ticketId: null,
    token: null,
    messages: [],
    lastMessageId: null,
    pollTimer: null,
    formSubmitted: false
  };

  // Criar estilos CSS
  function createStyles() {
    const styleId = 'taktchat-widget-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #taktchat-widget-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${state.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: ${state.config.zIndex};
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #taktchat-widget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      #taktchat-widget-button:active {
        transform: scale(0.95);
      }
      #taktchat-widget-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: ${state.config.zIndex};
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      #taktchat-widget-container.open {
        display: flex;
      }
      #taktchat-widget-header {
        background: ${state.config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #taktchat-widget-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      #taktchat-widget-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      #taktchat-widget-close:hover {
        background: rgba(255,255,255,0.2);
      }
      #taktchat-widget-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      #taktchat-widget-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      #taktchat-widget-form input,
      #taktchat-widget-form textarea {
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
      }
      #taktchat-widget-form input:focus,
      #taktchat-widget-form textarea:focus {
        outline: none;
        border-color: ${state.config.primaryColor};
      }
      #taktchat-widget-form button {
        padding: 12px;
        background: ${state.config.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      #taktchat-widget-form button:hover:not(:disabled) {
        opacity: 0.9;
      }
      #taktchat-widget-form button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .taktchat-message {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 80%;
      }
      .taktchat-message.user {
        align-self: flex-end;
        align-items: flex-end;
      }
      .taktchat-message.agent {
        align-self: flex-start;
        align-items: flex-start;
      }
      .taktchat-message-bubble {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      .taktchat-message.user .taktchat-message-bubble {
        background: ${state.config.primaryColor};
        color: white;
      }
      .taktchat-message.agent .taktchat-message-bubble {
        background: #f0f0f0;
        color: #333;
      }
      .taktchat-message-time {
        font-size: 11px;
        color: #999;
        padding: 0 4px;
      }
      #taktchat-widget-input-area {
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
      }
      #taktchat-widget-input-area input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
      }
      #taktchat-widget-input-area input:focus {
        outline: none;
        border-color: ${state.config.primaryColor};
      }
      #taktchat-widget-input-area button {
        padding: 10px 20px;
        background: ${state.config.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      #taktchat-widget-input-area button:hover:not(:disabled) {
        opacity: 0.9;
      }
      #taktchat-widget-input-area button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .taktchat-loading {
        text-align: center;
        padding: 20px;
        color: #999;
        font-size: 14px;
      }
      .taktchat-error {
        background: #fee;
        color: #c33;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        margin: 8px 0;
      }
      @media (max-width: 480px) {
        #taktchat-widget-container {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
          bottom: 90px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Formatar data/hora
  function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Renderizar mensagem
  function renderMessage(message) {
    const isUser = !message.fromMe;
    const time = formatTime(message.createdAt);
    return `
      <div class="taktchat-message ${isUser ? 'user' : 'agent'}">
        <div class="taktchat-message-bubble">${escapeHtml(message.body || '')}</div>
        <div class="taktchat-message-time">${time}</div>
      </div>
    `;
  }

  // Escapar HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Renderizar mensagens
  function renderMessages() {
    const body = document.getElementById('taktchat-widget-body');
    if (!body) return;

    if (state.messages.length === 0) {
      body.innerHTML = '<div class="taktchat-loading">Nenhuma mensagem ainda.</div>';
      return;
    }

    body.innerHTML = state.messages.map(renderMessage).join('');
    body.scrollTop = body.scrollHeight;
  }

  // Buscar mensagens da API
  async function fetchMessages() {
    if (!state.ticketId && !state.token) return;

    try {
      const params = new URLSearchParams();
      if (state.ticketId) params.append('ticketId', state.ticketId);
      if (state.token) params.append('token', state.token);

      const response = await fetch(`${state.config.apiUrl}/public/site-chat/messages?${params}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Ticket não encontrado, resetar estado
          state.ticketId = null;
          state.token = null;
          state.formSubmitted = false;
          renderForm();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const messages = await response.json();
      
      // Atualizar apenas se houver novas mensagens
      if (messages.length > state.messages.length || 
          (messages.length > 0 && messages[messages.length - 1].id !== state.lastMessageId)) {
        state.messages = messages;
        state.lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
        renderMessages();
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  }

  // Iniciar polling de mensagens
  function startPolling() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(fetchMessages, state.config.pollInterval);
    fetchMessages(); // Buscar imediatamente
  }

  // Parar polling
  function stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  // Renderizar formulário inicial
  function renderForm() {
    const body = document.getElementById('taktchat-widget-body');
    if (!body) return;

    body.innerHTML = `
      <form id="taktchat-widget-form">
        <input type="text" name="name" placeholder="Seu nome *" required>
        <input type="email" name="email" placeholder="Seu e-mail *" required>
        <input type="tel" name="phone" placeholder="Telefone (opcional)">
        <textarea name="message" placeholder="Mensagem inicial (opcional)" rows="3"></textarea>
        <button type="submit">Iniciar conversa</button>
      </form>
    `;

    const form = document.getElementById('taktchat-widget-form');
    form.addEventListener('submit', handleFormSubmit);
  }

  // Enviar formulário inicial
  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      message: formData.get('message') || null
    };

    if (state.config.companyId) {
      data.companyId = parseInt(state.config.companyId);
    } else if (state.config.companyToken) {
      data.companyToken = state.config.companyToken;
    } else {
      showError('Configuração inválida: companyId ou companyToken é obrigatório.');
      submitButton.disabled = false;
      submitButton.textContent = 'Iniciar conversa';
      return;
    }

    try {
      const response = await fetch(`${state.config.apiUrl}/public/site-chat/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao enviar formulário' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      state.ticketId = result.ticketId;
      state.token = result.token;
      state.formSubmitted = true;
      state.messages = [];

      // Buscar mensagens iniciais
      await fetchMessages();
      startPolling();
      renderChat();
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      showError(error.message || 'Erro ao iniciar conversa. Tente novamente.');
      submitButton.disabled = false;
      submitButton.textContent = 'Iniciar conversa';
    }
  }

  // Renderizar chat (após formulário)
  function renderChat() {
    const body = document.getElementById('taktchat-widget-body');
    if (!body) return;

    body.innerHTML = '<div class="taktchat-loading">Carregando mensagens...</div>';
    renderMessages();

    const inputArea = document.getElementById('taktchat-widget-input-area');
    if (inputArea) {
      const input = inputArea.querySelector('input');
      const sendButton = inputArea.querySelector('button');
      
      input.value = '';
      input.disabled = false;
      sendButton.disabled = false;
    }
  }

  // Enviar mensagem
  async function sendMessage() {
    const inputArea = document.getElementById('taktchat-widget-input-area');
    if (!inputArea) return;

    const input = inputArea.querySelector('input');
    const sendButton = inputArea.querySelector('button');
    const message = input.value.trim();

    if (!message) return;

    input.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Enviando...';

    const data = {
      body: message
    };

    if (state.ticketId) {
      data.ticketId = state.ticketId;
    } else if (state.token) {
      data.token = state.token;
    } else {
      showError('Sessão inválida. Por favor, recarregue a página.');
      input.disabled = false;
      sendButton.disabled = false;
      sendButton.textContent = 'Enviar';
      return;
    }

    try {
      const response = await fetch(`${state.config.apiUrl}/public/site-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao enviar mensagem' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      input.value = '';
      input.disabled = false;
      sendButton.disabled = false;
      sendButton.textContent = 'Enviar';

      // Buscar mensagens atualizadas
      await fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showError(error.message || 'Erro ao enviar mensagem. Tente novamente.');
      input.disabled = false;
      sendButton.disabled = false;
      sendButton.textContent = 'Enviar';
    }
  }

  // Mostrar erro
  function showError(message) {
    const body = document.getElementById('taktchat-widget-body');
    if (!body) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'taktchat-error';
    errorDiv.textContent = message;
    body.insertBefore(errorDiv, body.firstChild);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Toggle widget (abrir/fechar)
  function toggleWidget() {
    state.isOpen = !state.isOpen;
    const container = document.getElementById('taktchat-widget-container');
    if (container) {
      if (state.isOpen) {
        container.classList.add('open');
        if (!state.formSubmitted) {
          renderForm();
        } else {
          renderChat();
          startPolling();
        }
      } else {
        container.classList.remove('open');
        stopPolling();
      }
    }
  }

  // Criar HTML do widget
  function createWidget() {
    // Botão flutuante
    const button = document.createElement('button');
    button.id = 'taktchat-widget-button';
    button.innerHTML = state.config.buttonText;
    button.style.width = state.config.buttonSize;
    button.style.height = state.config.buttonSize;
    button.style.background = state.config.primaryColor;
    button.addEventListener('click', toggleWidget);

    // Container do chat
    const container = document.createElement('div');
    container.id = 'taktchat-widget-container';

    const header = document.createElement('div');
    header.id = 'taktchat-widget-header';
    header.innerHTML = `
      <h3>💬 Chat</h3>
      <button id="taktchat-widget-close">×</button>
    `;

    const body = document.createElement('div');
    body.id = 'taktchat-widget-body';

    const inputArea = document.createElement('div');
    inputArea.id = 'taktchat-widget-input-area';
    inputArea.innerHTML = `
      <input type="text" placeholder="Digite sua mensagem..." disabled>
      <button type="button" disabled>Enviar</button>
    `;

    const sendButton = inputArea.querySelector('button');
    const input = inputArea.querySelector('input');

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    header.querySelector('#taktchat-widget-close').addEventListener('click', toggleWidget);

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(inputArea);

    document.body.appendChild(button);
    document.body.appendChild(container);
  }

  // Inicializar widget
  function init() {
    state.config = getConfig();

    if (!state.config.companyId && !state.config.companyToken) {
      console.error('TaktChat Widget: companyId ou companyToken é obrigatório.');
      return;
    }

    createStyles();
    createWidget();
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expor API pública (opcional)
  window.TaktChatWidgetAPI = {
    open: toggleWidget,
    close: () => {
      if (state.isOpen) toggleWidget();
    },
    sendMessage: sendMessage
  };
})();
