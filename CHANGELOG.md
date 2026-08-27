# Changelog

Registro de mudanças relevantes do Taktchat.

Notas de versão detalhadas também em `.docs/anexos/notas-de-versao.md`.

## [Unreleased]

### Adicionado (feat)
- App Android (Capacitor) com WebView em `taktchat.com.br`; link **Baixar app Android** no login (`/downloads/taktchat.apk`). iOS/IPA e push ficam para depois.
- Modo móvel de conversas em `/tickets`: no celular (e no PWA instalado) some o menu do painel; avatar oferece **Painel completo**. PWA abre em `/tickets` (atalho `/atendimento` corrigido). Sem app nativo nem push FCM nesta entrega.
- Tour público em `/tour` (5 slides, ~1 min): pitch (problema + para quem), prints da landing, CTA **Falar com especialista**, links na vitrine v2. `/p/tour` redireciona para `/tour`.
- Landing de conversão em `/landing` (v2), arquivo em `/landing/v1`, página `/lgpd` e redirect de visitante `/` → `/landing` (#30).
- Toast para revisar Configurações quando a empresa ainda não tinha `CompaniesSettings` e a linha padrão foi criada.
- Login no header da landing; nos planos, CTA **Falar com especialista** quando o cadastro direto está desligado.
### Corrigido (fix)
- Visitante em `/` voltava para `/login`: o `useAuth` sobrescrevia o `guestRedirect="/landing"` da #30. No app Android (Capacitor) a raiz sem sessão continua em `/login`.
- Warnings CSS do Firefox na landing: JSS sem vendor prefixer inválido (`-moz-`).
- Warnings CSS do Firefox de `-ms-input-placeholder` (seletores IE do Emotion/MUI).
- Lista de tickets não quebra mais se a empresa não tiver `CompaniesSettings` (cria defaults).
- Primeiro ticket, contato, Encerrar/transferir, Facebook/IG, bot de filas, webhook e cron de rodízio não 500 se settings estiver ausente (`EnsureCompanySettings` / `resolveCompanySettings`).
- Rota `/landing` não devolve mais 403 do Nginx (conflito com a pasta de prints `public/landing/`).

### Alterado (refactor/chore)
- Landing v2: print do hero cabe no viewport, CTAs extras do meio da página saíram, claim de uptime 99,9% só na v1, dependência `react-ga4` não usada removida (#30).
- Frontend em produção: gzip nos estáticos do Nginx (`vendor.js` e demais JS/CSS), inclusive `application/x-javascript`.
### Quebra de compatibilidade (BREAKING)
- Visitante sem sessão em `/` passa a ir para `/landing` em vez de `/login` (#30).
---

## [2026-08-25] - v2.2.2v-26

### Alterado
- Inventário funcional e kit de produto (ver `.docs/anexos/notas-de-versao.md`).
