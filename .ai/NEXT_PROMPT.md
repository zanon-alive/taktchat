# Taktchat — continuidade de sessão

**Branch git:** `feat/landing-as-home`

## Estado
- Visitante web em `/` vai para `/landing` (não mais `/login`). Logado continua no Dashboard. Capacitor sem sessão continua em `/login`.
- Causa: `useAuth` sobrescrevia o `guestRedirect="/landing"` da #30.
- Commit e PR desta branch. Deploy não é pelo agente.
- `main` segue com PWA #35, QR/CORS #36 e app Android #37.

## Não fazer
- Deploy pelo agente. Código de push/iOS sem plano + OK.
- Reativar service worker.
