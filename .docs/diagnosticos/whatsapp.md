## Diagnósticos de sessão WhatsApp

### Sintomas comuns

- QR code não é exibido ou expira imediatamente.
- Sessão perde conexão com frequência.
- Mensagens enviadas ficam em `pending` por tempo prolongado.

### Checklist de validação

1. Confirmar credenciais e configuração do número (ver `legacy/VALIDACAO_WHATSAPP_CONFIG.md`).
2. Garantir que `backend-private` possui permissões corretas.
3. Monitorar logs do serviço Baileys (`backend/src/services/WbotServices`).
4. Validar conectividade com WhatsApp Web (bloqueios regionais/proxy).

### Recuperação rápida

- Regerar QR code via painel e parear novamente.
- Limpar cache da sessão: remover pasta correspondente no volume `backend-private` (apenas após backup).
- Reiniciar serviço backend (consultar `legacy/BACKEND-RESTART-FIX.md` para detalhes).

### Boas práticas

- Utilizar conexão estável e número exclusivo para atendimento.
- Manter dispositivo físico ligado/conectado à internet (quando aplicativo oficial é utilizado).
- Registrar mudanças de aparelho ou chips em `anexos/incidentes.md`.

