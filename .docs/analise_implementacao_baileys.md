# Análise e Implementação: Diagnóstico de Conexão Baileys

## Objetivo
Implementar um sistema de diagnóstico de conexão para o usuário final, permitindo identificar se problemas de desconexão são causados pela plataforma ou pelo WhatsApp, e fornecer sugestões de resolução.

## Problema Original
Um número específico (`5514997311404`) desconectava consistentemente após ~60 segundos com erro `device_removed` (401), indicando um bloqueio/restrição do lado do servidor do WhatsApp.

## Solução Implementada

### 1. Backend
- **Banco de Dados**: Criada tabela `ConnectionLogs` para armazenar histórico de eventos de conexão.
- **Model**: Criado modelo `ConnectionLog`.
- **Helper**: Implementado `ConnectionDiagnostic` para analisar erros (401, 403, 428, 515) e gerar diagnósticos amigáveis.
- **Service**: Criado `ConnectionLogService` para gerenciar logs.
- **Integração**: Atualizado `wbot.ts` para:
    - Registrar logs de conexão e QR Code.
    - Emitir eventos em tempo real via Socket.IO (`whatsapp-{id}-diagnostic`) com diagnóstico e sugestões.
- **API**: Criadas rotas para buscar logs (`/connection-logs/whatsapp/:whatsappId`).

### 2. Frontend
- **Componente `ConnectionTimeline`**: Visualização cronológica dos eventos de conexão.
- **Componente `ConnectionDiagnosticPanel`**: Painel que exibe alertas de diagnóstico em tempo real e a timeline.
- **Integração**: Adicionado botão "Diagnóstico" no modal de conexão do WhatsApp.

## Como Testar
1. Abra o modal de conexão de um WhatsApp.
2. Se o WhatsApp já estiver cadastrado, clique no botão "Diagnóstico".
3. Observe a timeline com o histórico de conexões.
4. Tente conectar um número. Se houver erro ou desconexão, um alerta aparecerá com o diagnóstico e sugestões.

## Próximos Passos
- Monitorar a eficácia dos diagnósticos com usuários reais.
- Refinar as mensagens de sugestão baseadas em novos padrões de erro identificados.
