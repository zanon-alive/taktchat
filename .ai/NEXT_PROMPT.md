# Taktchat — continuidade de sessão

**Data:** 2026-09-02  
**Branch:** `feat/licenca-no-cadastro-empresa` (commit local; sem push/PR)

## Recém feito

Demanda **finalizada** pelo usuário (2026-09-02): licença obrigatória no cadastro de empresa.

- Modal `/companies`: plano, início (hoje) e término (hoje+30, editável), todos obrigatórios.
- `CreateCompanyService` cria `License` `active` na mesma transação (direct e whitelabel); rollback se a licença falhar.
- `dueDate` da company = término da licença.
- Edição: sem vigente → mostra bloco e cria no save; com vigente → só texto “vigente até…”.
- Specs backend (22) e modal (4) passando.
- CHANGELOG `[Unreleased]`, README, `.docs/visao-geral/whitelabel-architecture.md`, `.docs/docs_admin.md`.

Prompt desta demanda: `.docs/branchs/feat/licenca-no-cadastro-empresa/00-PROMPT-NOVO-AGENTE.md`

## Pendente (usuário)

- Push da branch (se pedir).
- PR (perguntar depois do push; não criar sozinho).
- **Não deploy.**
- Gerson em produção: criar licença em `/licenses` (humano). Não é código desta branch.

## Não fazer

- C6 / PIX nativo / cartão nativo em Faturas (só com pedido explícito).
- Interceptor/toastError do 403 do cadeado.
- Push direto na `main`.
- `analyze_demand` / `log_activity` no Cérebro para este projeto.
- Continuar em `fix/ci-build-pos-pr57`.
