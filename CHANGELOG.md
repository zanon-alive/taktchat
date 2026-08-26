# Changelog

Registro de mudanças relevantes do Taktchat.

Notas de versão detalhadas também em `.docs/anexos/notas-de-versao.md`.

## [Unreleased]

### Adicionado (feat)
- Landing de conversão em `/landing` (v2), arquivo em `/landing/v1`, página `/lgpd` e redirect de visitante `/` → `/landing` (#30).
- Toast para revisar Configurações quando a empresa ainda não tinha `CompaniesSettings` e a linha padrão foi criada.
### Corrigido (fix)
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
