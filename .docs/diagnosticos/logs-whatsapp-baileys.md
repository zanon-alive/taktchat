# Logs do WhatsApp (Baileys) – Erros esperados

Este documento descreve mensagens de log geradas pela integração com WhatsApp (Baileys/libsignal) que são **esperadas** e, em geral, não indicam falha da aplicação.

## "Failed to decrypt" / "SessionError" / "Bad MAC" / "No matching sessions found for message"

- **Quando aparecem:** ao conectar a sessão ou ao receber mensagens antigas ou de dispositivos vinculados (JID com `@lid`).
- **Origem:** bibliotecas libsignal/Baileys (criptografia Signal). Parte desses erros é emitida **diretamente pelo libsignal** (para stderr), sem passar pelo logger do Baileys.
- **Significado:** a sessão local não consegue descriptografar aquela mensagem (sessão diferente, mensagem antiga ou de outro dispositivo). É comportamento conhecido do protocolo.
- **Ação:** podem ser ignorados quando a tela e as conversas ao vivo estão normais. O backend já trata esses casos rebaixando o nível do log para debug quando aplicável (ver `wbot.ts` – logger customizado do Baileys).

## "Closing open session in favor of incoming prekey bundle" / "Closing session"

- **Quando aparecem:** durante a troca/atualização de sessões de criptografia.
- **Origem:** protocolo Signal (libsignal).
- **Significado:** uma sessão anterior foi fechada para abrir uma nova (prekey bundle). Comportamento normal.
- **Ação:** nenhuma; o backend oculta esses dumps no console (incluem material de sessão).

---

## Como proceder com esses erros

1. **Se a tela está funcionando** (mensagens chegando, atendimentos normais): tratar como esperado e **não é necessário corrigir nada**. Essas mensagens podem ser ignoradas.
2. **Reduzir ruído de decrypt no console (opcional):** defina `SUPPRESS_BAILEYS_DECRYPT_LOGS=1` no backend para filtrar `console.error` de "Failed to decrypt" / "Bad MAC". Dumps de `Closing session` já são omitidos automaticamente.
3. **Monitorar:** se **mensagens ao vivo** passarem a não aparecer na tela, aí sim investigar (limpar auth/sessão e reconectar, evitar múltiplos dispositivos no mesmo número).

## Quando se preocupar

- **Não se preocupe** se os erros aparecem principalmente logo após conectar (sync/histórico) e as conversas ativas continuam chegando.
- **Preocupe-se** se atendimentos reclamarem que mensagens não chegam ou se muitas conversas ativas deixarem de ser exibidas. Nesse caso, considere reconectar a sessão (novo QR) ou revisar uso do mesmo número em mais de um lugar.

---

## Referência

- Logger do Baileys é configurado em `backend/src/libs/wbot.ts` (wrapper que rebaixa erros de decrypt/sessão para debug).
- Filtro de dump de sessão (libsignal): `backend/src/utils/suppressBaileysDecryptLogs.ts`. Erros de decrypt no `console.error` continuam opcionais com `SUPPRESS_BAILEYS_DECRYPT_LOGS=1`.
- Tratamento de JID `@lid` em `backend/src/services/WbotServices/wbotMessageListener.ts` (função `verifyContact`).
