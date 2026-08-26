# Changelog

Registro de mudanças relevantes do Taktchat.

Notas de versão detalhadas também em `.docs/anexos/notas-de-versao.md`.

## [Unreleased]

### Adicionado (feat)
- Landing de conversão em `/landing` (v2), arquivo em `/landing/v1`, página `/lgpd` e redirect de visitante `/` → `/landing`.
### Corrigido (fix)
- Warnings CSS do Firefox na landing: JSS sem vendor prefixer inválido (`-moz-`).
- Warnings CSS do Firefox de `-ms-input-placeholder` (seletores IE do Emotion/MUI).

### Alterado (refactor/chore)

### Quebra de compatibilidade (BREAKING)
- Visitante sem sessão em `/` passa a ir para `/landing` em vez de `/login`.
---

## [2026-08-25] - v2.2.2v-26

### Alterado
- Inventário funcional e kit de produto (ver `.docs/anexos/notas-de-versao.md`).
