# Template — ficha de tela

Copiar um bloco por tela visitada (colar em `11-diario-navegacao.md` ou em arquivos `fichas/<rota>.md`). Oito campos. Sem isso o checklist não vira catálogo.

```markdown
## Ficha: [rótulo do menu]

- **URL:**
- **Persona logada:**
- **Status:** V | B | N
- **Para que serve (1–2 frases):**
- **Ações principais (botões/menus):**
- **Estados vazios / erros / desconectado:**
- **Quem deveria usar:**
- **Screenshot:** `entregaveis/extras/screenshots/<arquivo>.png`
```

Regras:

- Uma ficha = uma URL (ou um modal importante, se for o caso do ticket).
- Não descrever componente React.
- Se a tela for só um submenu, ficha no item folha.
- Ticket: fichas separadas para lista, chat, transferir, encerrar, se forem superfícies distintas.
