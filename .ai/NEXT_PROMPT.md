# Taktchat — continuidade de sessão

**Branch git:** `feat/onboarding-cobranca-pos-trial`  
**Data:** 2026-09-01

## Nesta sessão

Cadeado pós-trial do cadastro na landing:

- Trial 14 dias, sem cartão no cadastro.
- `dueDate` alinhado à licença + fatura open no signup.
- Admin com licença vencida faz login e cai em `/financeiro`.
- Atendente: 403 (peça ao admin).
- APIs operacionais bloqueadas (`ERR_BILLING_ONLY`).
- Webhook Mercado Pago (se já existir token) renova License + dueDate.
- C6 / PIX nativo: **próxima demanda**.
- UX: toast do atendente lê `error` da API; AppBar não monta chat/avisos/notificações/aviso de licença no modo faturas (evita 403).

## Testes

Relato do usuário (2026-09-01): todos os testes das modificações passaram.

## Não fazer

- Deploy pelo agente.
- Implementar gateway C6 nesta branch.
