# Matriz role × tela (preenchida — versão 1)

Fonte: payload de login (API) + UI da atendente + código de menu.  
Legenda: **V** vê/acessa · **A** age · **L** lê · **—** não · **P** plano/flag · **?** UI não fotografada

Personas: Dono · Parceiro · Admin emp. · Atendente · Supervisor

| Tela | Dono | Parceiro | Admin | Atend. | Superv. |
|------|------|----------|-------|--------|---------|
| Login / landing | V | V | V | V | V |
| Dashboard `/` | V | V | V | — (403) | V |
| Tickets | V | V | V | V | V |
| Tempo real | V | V | V | — | V |
| Contatos / tags | V | V | V | V (ver) | V |
| Campanhas | V | V | P | — | — |
| Flow Builder | V | V | P | — | — |
| Conexões | V | V | V | — | — |
| Todas conexões | V | — | — | — | — |
| Usuários / filas | V | V | V | — | — |
| Settings | V | V | V | — | — |
| Empresas / licenças | V | V (filhas) | — | — | — |
| Apresentações `/apresentacoes` | V | — | — | — | — |
| Cobrança parceiro | V | — | — | — | — |
| Financeiro | V | V | V | — | — |
| API externa | P | P | P | — | — |

## Ações de ticket

| Ação | Dono | Parceiro | Admin | Atend. | Superv. |
|------|------|----------|-------|--------|---------|
| Ver | A | A | A | A | A |
| Criar | A | A | A | —* | —* |
| Atualizar / transferir | A | A | A | — | A |
| Encerrar | A | A | A | A | A |
| Excluir | A | A | A | — | — |

\*Atendente não recebe `tickets.create` no fallback; criar conversa costuma ser admin ou permissão extra.

API desta versão: Beatriz sem `tickets.create`/`transfer`; Diego com update/transfer.
