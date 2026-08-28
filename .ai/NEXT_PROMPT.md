# Taktchat — continuidade de sessão

**Branch git:** `feat/ux-onda-a` (Onda A em implementação; base `docs/ux-design-pre-producao`)
**Demanda:** UX pré-produção. Inventário em `.docs/ux-design/levantamento-pre-producao.md`.

## Antes do código
- Sem TeleCX. Cores Taktchat. 1º PR = Onda A.

## Estado
- Onda A: Tailwind `darkMode: 'class'` + `applyColorScheme` + CssBaseline dentro do ThemeProvider.
- Próximo: PR da Onda A, depois B, C, D. No fim, percurso comparativo.

## Não fazer
- Deploy pelo agente.
- Não commitar `.kiro/`, `.telecontrol/`, rules Cursor soltas.
