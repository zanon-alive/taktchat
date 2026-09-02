# Taktchat — continuidade de sessão

**Branch git:** `fix/ci-build-pos-pr57`  
**Data:** 2026-09-01

## Nesta sessão

Hotfix do CI da `main` após o merge do PR #57:

- Backend: `SerializedUser` em `AuthUserService` voltou a ter `token?: string`.
- Frontend: fragmento JSX do menu `billingOnly` fechado em `MainListItems.js`.

## Recém mergeado

PR #57 — cadeado pós-trial. Commit `8590484`. CI da `main` ficou vermelho até este hotfix.

## Próxima demanda (combinado)

C6 / PIX nativo / cartão nativo na tela de Faturas. **Não implementar sem pedido explícito.**

## Não fazer

- Deploy pelo agente.
- Push direto na `main`.
