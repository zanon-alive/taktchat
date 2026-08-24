-- Seed local do kit de documentação. SOMENTE localhost. Idempotente.
-- Senha dos usuários @taktchat.local: LocalTest#2026

BEGIN;

INSERT INTO "Companies" (name, phone, email, "planId", status, "dueDate", "createdAt", "updatedAt")
SELECT 'Parceiro Demo Kit', '11900000001', 'parceiro@taktchat.local', 1, true, '2027-12-31', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Companies" WHERE name = 'Parceiro Demo Kit');

INSERT INTO "Companies" (name, phone, email, "planId", status, "dueDate", "createdAt", "updatedAt")
SELECT 'Cliente Demo Kit', '11900000002', 'admin.cliente@taktchat.local', 1, true, '2027-12-31', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Companies" WHERE name = 'Cliente Demo Kit');

INSERT INTO "CompaniesSettings" (
  "companyId", "hoursCloseTicketsAuto", "chatBotType", "acceptCallWhatsapp", "userRandom",
  "sendGreetingMessageOneQueues", "sendSignMessage", "sendFarewellWaitingTicket", "userRating",
  "sendGreetingAccepted", "CheckMsgIsGroup", "sendQueuePosition", "scheduleType",
  "acceptAudioMessageContact", "enableLGPD", "sendMsgTransfTicket", "requiredTag",
  "lgpdDeleteMessage", "lgpdHideNumber", "lgpdConsent", "lgpdLink", "lgpdMessage",
  "DirectTicketsToWallets", "closeTicketOnTransfer", "transferMessage", "greetingAcceptedMessage",
  "AcceptCallWhatsappMessage", "sendQueuePositionMessage", "showNotificationPending",
  "openaiApiKey", "openaiModel", "ragEmbeddingModel", "ragEmbeddingDims", "ragEnabled", "ragTopK",
  "createdAt", "updatedAt"
)
SELECT c.id, s."hoursCloseTicketsAuto", s."chatBotType", s."acceptCallWhatsapp", s."userRandom",
  s."sendGreetingMessageOneQueues", s."sendSignMessage", s."sendFarewellWaitingTicket", s."userRating",
  s."sendGreetingAccepted", s."CheckMsgIsGroup", s."sendQueuePosition", s."scheduleType",
  s."acceptAudioMessageContact", s."enableLGPD", s."sendMsgTransfTicket", s."requiredTag",
  s."lgpdDeleteMessage", s."lgpdHideNumber", s."lgpdConsent", s."lgpdLink", s."lgpdMessage",
  s."DirectTicketsToWallets", s."closeTicketOnTransfer", s."transferMessage", s."greetingAcceptedMessage",
  s."AcceptCallWhatsappMessage", s."sendQueuePositionMessage", s."showNotificationPending",
  '', s."openaiModel", s."ragEmbeddingModel", s."ragEmbeddingDims", s."ragEnabled", s."ragTopK",
  NOW(), NOW()
FROM "Companies" c
CROSS JOIN "CompaniesSettings" s
WHERE s."companyId" = 1
  AND c.name IN ('Parceiro Demo Kit', 'Cliente Demo Kit')
  AND NOT EXISTS (SELECT 1 FROM "CompaniesSettings" cs WHERE cs."companyId" = c.id);

INSERT INTO "Users" (
  name, email, "passwordHash", profile, super, "companyId",
  "allTicket", "showDashboard", "allowRealTime", "allowConnections",
  "allHistoric", "allowGroup", language, "startWork", "endWork",
  "createdAt", "updatedAt"
)
SELECT 'Dono Plataforma (kit)', 'dono@taktchat.local',
  '$2a$08$nQpaca4BSpb7TPRGxt.ypeWhfk.a3plHceWto8uRmzWrYbrmVZVle',
  'admin', true, 1, 'enable', 'enabled', 'enabled', 'enabled',
  'disabled', true, 'pt-BR', '00:00', '23:59', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'dono@taktchat.local');

INSERT INTO "Users" (
  name, email, "passwordHash", profile, super, "companyId",
  "allTicket", "showDashboard", "allowRealTime", "allowConnections",
  language, "startWork", "endWork", "createdAt", "updatedAt"
)
SELECT 'Ana Parceira', 'parceiro@taktchat.local',
  '$2a$08$nQpaca4BSpb7TPRGxt.ypeWhfk.a3plHceWto8uRmzWrYbrmVZVle',
  'admin', false, (SELECT id FROM "Companies" WHERE name = 'Parceiro Demo Kit'),
  'enable', 'enabled', 'enabled', 'enabled',
  'pt-BR', '00:00', '23:59', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'parceiro@taktchat.local');

INSERT INTO "Users" (
  name, email, "passwordHash", profile, super, "companyId",
  "allTicket", "showDashboard", "allowRealTime", "allowConnections",
  language, "startWork", "endWork", "createdAt", "updatedAt"
)
SELECT 'Carlos Admin', 'admin.cliente@taktchat.local',
  '$2a$08$nQpaca4BSpb7TPRGxt.ypeWhfk.a3plHceWto8uRmzWrYbrmVZVle',
  'admin', false, (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  'enable', 'enabled', 'enabled', 'enabled',
  'pt-BR', '00:00', '23:59', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'admin.cliente@taktchat.local');

INSERT INTO "Users" (
  name, email, "passwordHash", profile, super, "companyId",
  "allTicket", "showDashboard", "allowRealTime", "allowConnections",
  language, "startWork", "endWork", "createdAt", "updatedAt"
)
SELECT 'Beatriz Atendente', 'atendente@taktchat.local',
  '$2a$08$nQpaca4BSpb7TPRGxt.ypeWhfk.a3plHceWto8uRmzWrYbrmVZVle',
  'user', false, (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  'disable', 'disabled', 'disabled', 'disabled',
  'pt-BR', '08:00', '18:00', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'atendente@taktchat.local');

INSERT INTO "Users" (
  name, email, "passwordHash", profile, super, "companyId",
  "allTicket", "showDashboard", "allowRealTime", "allowConnections",
  language, "startWork", "endWork", "createdAt", "updatedAt"
)
SELECT 'Diego Supervisor', 'supervisor@taktchat.local',
  '$2a$08$nQpaca4BSpb7TPRGxt.ypeWhfk.a3plHceWto8uRmzWrYbrmVZVle',
  'user', false, (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  'enable', 'enabled', 'enabled', 'disabled',
  'pt-BR', '08:00', '18:00', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'supervisor@taktchat.local');

INSERT INTO "Queues" (name, color, "greetingMessage", "companyId", "orderQueue", "ativarRoteador", "tempoRoteador", "closeTicket", "createdAt", "updatedAt")
SELECT 'Suporte', '#1B5E20', 'Olá! Você chegou no suporte da Cliente Demo.',
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'), 1, false, 0, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Queues" q JOIN "Companies" c ON c.id = q."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND q.name = 'Suporte'
);

INSERT INTO "Queues" (name, color, "greetingMessage", "companyId", "orderQueue", "ativarRoteador", "tempoRoteador", "closeTicket", "createdAt", "updatedAt")
SELECT 'Vendas', '#0D47A1', 'Olá! Time de vendas da Cliente Demo.',
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'), 2, false, 0, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Queues" q JOIN "Companies" c ON c.id = q."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND q.name = 'Vendas'
);

INSERT INTO "Queues" (name, color, "greetingMessage", "companyId", "orderQueue", "ativarRoteador", "tempoRoteador", "closeTicket", "createdAt", "updatedAt")
SELECT 'Financeiro', '#E65100', 'Olá! Financeiro da Cliente Demo.',
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'), 3, false, 0, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Queues" q JOIN "Companies" c ON c.id = q."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND q.name = 'Financeiro'
);

INSERT INTO "Queues" (name, color, "greetingMessage", "companyId", "orderQueue", "ativarRoteador", "tempoRoteador", "closeTicket", "createdAt", "updatedAt")
SELECT 'Atendimento Parceiro', '#6A1B9A', 'Olá! Atendimento do parceiro.',
  (SELECT id FROM "Companies" WHERE name = 'Parceiro Demo Kit'), 1, false, 0, false, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Queues" q JOIN "Companies" c ON c.id = q."companyId"
  WHERE c.name = 'Parceiro Demo Kit' AND q.name = 'Atendimento Parceiro'
);

INSERT INTO "UserQueues" ("userId", "queueId", "createdAt", "updatedAt")
SELECT u.id, q.id, NOW(), NOW()
FROM "Users" u
JOIN "Companies" c ON c.id = u."companyId" AND c.name = 'Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id
WHERE u.email IN ('admin.cliente@taktchat.local', 'supervisor@taktchat.local')
  AND NOT EXISTS (SELECT 1 FROM "UserQueues" uq WHERE uq."userId" = u.id AND uq."queueId" = q.id);

INSERT INTO "UserQueues" ("userId", "queueId", "createdAt", "updatedAt")
SELECT u.id, q.id, NOW(), NOW()
FROM "Users" u
JOIN "Companies" c ON c.id = u."companyId" AND c.name = 'Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Suporte'
WHERE u.email = 'atendente@taktchat.local'
  AND NOT EXISTS (SELECT 1 FROM "UserQueues" uq WHERE uq."userId" = u.id AND uq."queueId" = q.id);

INSERT INTO "UserQueues" ("userId", "queueId", "createdAt", "updatedAt")
SELECT u.id, q.id, NOW(), NOW()
FROM "Users" u
JOIN "Companies" c ON c.id = u."companyId" AND c.name = 'Parceiro Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id
WHERE u.email = 'parceiro@taktchat.local'
  AND NOT EXISTS (SELECT 1 FROM "UserQueues" uq WHERE uq."userId" = u.id AND uq."queueId" = q.id);

INSERT INTO "Whatsapps" (
  name, status, "isDefault", retries, "companyId", channel, "channelType",
  "allowGroup", "timeUseBotQueues", "groupAsTicket", "expiresTicket",
  "createdAt", "updatedAt"
)
SELECT 'WhatsApp Cliente Demo Kit', 'DISCONNECTED', true, 0,
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  'whatsapp', 'baileys', false, '0', 'disabled', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Whatsapps" WHERE name = 'WhatsApp Cliente Demo Kit');

INSERT INTO "WhatsappQueues" ("whatsappId", "queueId", "createdAt", "updatedAt")
SELECT w.id, q.id, NOW(), NOW()
FROM "Whatsapps" w
JOIN "Companies" c ON c.id = w."companyId" AND c.name = 'Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id
WHERE w.name = 'WhatsApp Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "WhatsappQueues" wq WHERE wq."whatsappId" = w.id AND wq."queueId" = q.id);

INSERT INTO "Tags" (name, color, "companyId", kanban, "timeLane", "rollbackLaneId", "createdAt", "updatedAt")
SELECT v.name, v.color, (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  v.kanban, 0, 0, NOW(), NOW()
FROM (VALUES
  ('Urgente', '#C62828', 1),
  ('VIP', '#F9A825', 1),
  ('Aguardando cliente', '#1565C0', 0),
  ('Resolvido', '#2E7D32', 1)
) AS v(name, color, kanban)
WHERE NOT EXISTS (
  SELECT 1 FROM "Tags" t
  JOIN "Companies" c ON c.id = t."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND t.name = v.name
);

INSERT INTO "Contacts" (
  name, number, email, "companyId", channel, active, "isGroup",
  "acceptAudioMessage", "disableBot", "pictureUpdated", florder,
  uuid, "canonicalNumber", "isWhatsappValid", "whatsappId", "createdAt", "updatedAt"
)
SELECT v.name, v.number, v.email,
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  'whatsapp', true, false, true, false, false, false,
  gen_random_uuid(), v.number, true,
  (SELECT id FROM "Whatsapps" WHERE name = 'WhatsApp Cliente Demo Kit'),
  NOW(), NOW()
FROM (VALUES
  ('Maria Silva', '5511900001001', 'maria.silva@demo.local'),
  ('João Oliveira', '5511900001002', 'joao.oliveira@demo.local'),
  ('Ana Costa', '5511900001003', 'ana.costa@demo.local'),
  ('Mercado Central', '5511900001004', 'contato@mercadocentral.demo'),
  ('Pedro Santos', '5511900001005', 'pedro.santos@demo.local'),
  ('Carla Mendes', '5511900001006', 'carla.mendes@demo.local')
) AS v(name, number, email)
WHERE NOT EXISTS (
  SELECT 1 FROM "Contacts" ct
  JOIN "Companies" c ON c.id = ct."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND ct.number = v.number
);

-- Ticket aberto com atendente (Maria / Suporte)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'open', 'Oi, meu pedido ainda não chegou.',
  ct.id, u.id, w.id, q.id, c.id, gen_random_uuid(), false, 2, 'whatsapp', false, true, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001001'
JOIN "Users" u ON u.email = 'atendente@taktchat.local'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Suporte'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Ticket pendente sem atendente (João / Vendas)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'pending', 'Quero uma proposta para 10 licenças.',
  ct.id, NULL, w.id, q.id, c.id, gen_random_uuid(), false, 1, 'whatsapp', false, true, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001002'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Vendas'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Ticket aberto com supervisor (Ana / Suporte)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'open', 'Preciso falar com um supervisor.',
  ct.id, u.id, w.id, q.id, c.id, gen_random_uuid(), false, 1, 'whatsapp', false, true, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001003'
JOIN "Users" u ON u.email = 'supervisor@taktchat.local'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Suporte'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Ticket aberto financeiro (Mercado Central)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'open', 'A nota fiscal veio com o CNPJ errado.',
  ct.id, u.id, w.id, q.id, c.id, gen_random_uuid(), false, 3, 'whatsapp', false, true, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001004'
JOIN "Users" u ON u.email = 'atendente@taktchat.local'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Financeiro'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Ticket pendente na fila da atendente (Carla / Suporte)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'pending', 'Oi, preciso de ajuda com meu acesso.',
  ct.id, NULL, w.id, q.id, c.id, gen_random_uuid(), false, 1, 'whatsapp', false, true, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001006'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Suporte'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Ticket encerrado (Pedro)
INSERT INTO "Tickets" (
  status, "lastMessage", "contactId", "userId", "whatsappId", "queueId", "companyId",
  uuid, "isGroup", "unreadMessages", channel, "isBot", "isActiveDemand", "createdAt", "updatedAt"
)
SELECT 'closed', 'Obrigado, está resolvido.',
  ct.id, u.id, w.id, q.id, c.id, gen_random_uuid(), false, 0, 'whatsapp', false, false, NOW(), NOW()
FROM "Companies" c
JOIN "Contacts" ct ON ct."companyId" = c.id AND ct.number = '5511900001005'
JOIN "Users" u ON u.email = 'admin.cliente@taktchat.local'
JOIN "Whatsapps" w ON w."companyId" = c.id AND w.name = 'WhatsApp Cliente Demo Kit'
JOIN "Queues" q ON q."companyId" = c.id AND q.name = 'Suporte'
WHERE c.name = 'Cliente Demo Kit'
  AND NOT EXISTS (SELECT 1 FROM "Tickets" t WHERE t."contactId" = ct.id AND t."companyId" = c.id);

-- Mensagens de exemplo no ticket da Maria
INSERT INTO "Messages" (body, ack, read, "ticketId", "fromMe", "isDeleted", "contactId", "companyId", "queueId", "createdAt", "updatedAt")
SELECT 'Oi, meu pedido ainda não chegou.', 3, true, t.id, false, false,
  t."contactId", t."companyId", t."queueId", NOW() - interval '6 minutes', NOW()
FROM "Tickets" t
JOIN "Contacts" ct ON ct.id = t."contactId" AND ct.number = '5511900001001'
JOIN "Companies" c ON c.id = t."companyId" AND c.name = 'Cliente Demo Kit'
WHERE NOT EXISTS (SELECT 1 FROM "Messages" m WHERE m."ticketId" = t.id AND m.body = 'Oi, meu pedido ainda não chegou.');

INSERT INTO "Messages" (body, ack, read, "ticketId", "fromMe", "isDeleted", "contactId", "companyId", "queueId", "createdAt", "updatedAt")
SELECT 'Olá Maria! Pode me informar o número do pedido?', 3, true, t.id, true, false,
  NULL, t."companyId", t."queueId", NOW() - interval '4 minutes', NOW()
FROM "Tickets" t
JOIN "Contacts" ct ON ct.id = t."contactId" AND ct.number = '5511900001001'
JOIN "Companies" c ON c.id = t."companyId" AND c.name = 'Cliente Demo Kit'
WHERE NOT EXISTS (SELECT 1 FROM "Messages" m WHERE m."ticketId" = t.id AND m.body LIKE 'Olá Maria!%');

INSERT INTO "Messages" (body, ack, read, "ticketId", "fromMe", "isDeleted", "contactId", "companyId", "queueId", "createdAt", "updatedAt")
SELECT 'É o pedido 45821.', 3, true, t.id, false, false,
  t."contactId", t."companyId", t."queueId", NOW() - interval '2 minutes', NOW()
FROM "Tickets" t
JOIN "Contacts" ct ON ct.id = t."contactId" AND ct.number = '5511900001001'
JOIN "Companies" c ON c.id = t."companyId" AND c.name = 'Cliente Demo Kit'
WHERE NOT EXISTS (SELECT 1 FROM "Messages" m WHERE m."ticketId" = t.id AND m.body = 'É o pedido 45821.');

-- Tags nos tickets
INSERT INTO "TicketTags" ("ticketId", "tagId", "createdAt", "updatedAt")
SELECT t.id, tag.id, NOW(), NOW()
FROM "Tickets" t
JOIN "Contacts" ct ON ct.id = t."contactId"
JOIN "Companies" c ON c.id = t."companyId" AND c.name = 'Cliente Demo Kit'
JOIN "Tags" tag ON tag."companyId" = c.id
WHERE (
    (ct.number = '5511900001001' AND tag.name = 'Urgente')
    OR (ct.number = '5511900001004' AND tag.name = 'VIP')
    OR (ct.number = '5511900001005' AND tag.name = 'Resolvido')
  )
  AND NOT EXISTS (
    SELECT 1 FROM "TicketTags" tt WHERE tt."ticketId" = t.id AND tt."tagId" = tag.id
  );

INSERT INTO "QuickMessages" (shortcode, message, "companyId", "userId", geral, visao, "createdAt", "updatedAt")
SELECT '/saudacao', 'Olá! Sou da Cliente Demo, como posso ajudar?',
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  (SELECT id FROM "Users" WHERE email = 'atendente@taktchat.local'),
  true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "QuickMessages" qm
  JOIN "Companies" c ON c.id = qm."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND qm.shortcode = '/saudacao'
);

INSERT INTO "QuickMessages" (shortcode, message, "companyId", "userId", geral, visao, "createdAt", "updatedAt")
SELECT '/aguardar', 'Estou verificando com o time interno. Já te retorno.',
  (SELECT id FROM "Companies" WHERE name = 'Cliente Demo Kit'),
  (SELECT id FROM "Users" WHERE email = 'atendente@taktchat.local'),
  true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "QuickMessages" qm
  JOIN "Companies" c ON c.id = qm."companyId"
  WHERE c.name = 'Cliente Demo Kit' AND qm.shortcode = '/aguardar'
);

COMMIT;
