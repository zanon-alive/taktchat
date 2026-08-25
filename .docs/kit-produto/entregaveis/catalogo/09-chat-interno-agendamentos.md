# Chat interno, agendamentos e respostas rápidas

- Chat interno `/chats` — plano `useInternalChat`
- Agendamento de mensagens/ações `/schedules` — plano `useSchedules`
- Horários/jornada da empresa — configuração separada em Settings
- Respostas rápidas `/quick-messages` — seed: `/saudacao`, `/aguardar` (Beatriz)

Os dois tipos de agendamento não são equivalentes. Jobs agendados exigem Redis.
Status: respostas rápidas simuladas no banco; chat interno e agenda não exercitados na UI nesta versão.
