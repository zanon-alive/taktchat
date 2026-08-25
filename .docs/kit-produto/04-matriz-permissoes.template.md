# Template — Matriz role × tela × ação

Copiar este arquivo para `entregaveis/extras/matriz-permissoes.md` na Fase 2 e preencher. Não editar o template com dados de uma sessão específica.

## Legenda

| Símbolo | Significado |
|---------|-------------|
| V | Vê o menu / acessa a tela |
| A | Pode executar a ação (criar, editar, excluir, disparar) |
| L | Somente leitura |
| — | Não vê / não acessa |
| ? | Não testado |
| P | Depende de permissão granular ou flag de plano |

Personas (colunas): Dono · Parceiro · Admin empresa · Atendente · Supervisor (se existir)

## Menus e telas

| Tela / rota | Dono | Parceiro | Admin emp. | Atendente | Supervisor | Notas |
|-------------|------|----------|------------|-----------|------------|-------|
| Landing `/landing` | | | | | | pública |
| Login | | | | | | |
| Dashboard `/` | | | | | | |
| Tickets `/tickets` | | | | | | |
| Tempo real `/moments` | | | | | | |
| Respostas rápidas | | | | | | |
| Kanban | | | | | | conferir URL |
| Contatos | | | | | | |
| Importar contatos | | | | | | |
| Agendamentos | | | | | | plano |
| Tags | | | | | | |
| Chat interno | | | | | | plano |
| Ajudas | | | | | | |
| Campanhas | | | | | | plano |
| Listas de contatos | | | | | | |
| Config campanhas | | | | | | |
| Flow Builder | | | | | | |
| Frases / phrase-lists | | | | | | |
| Anúncios | | | | | | super? |
| API externa | | | | | | plano |
| Usuários | | | | | | |
| Filas | | | | | | |
| Prompts IA | | | | | | plano |
| Integrações | | | | | | plano |
| Conexões | | | | | | |
| Todas as conexões | | | | | | super |
| Arquivos | | | | | | |
| Financeiro | | | | | | |
| Configurações | | | | | | |
| Configurações IA | | | | | | |
| Empresas | | | | | | super ou whitelabel |
| Licenças | | | | | | super ou whitelabel |
| Relatório cobrança | | | | | | super |
| Relatórios `/reports` | | | | | | |

## Ações críticas (além de “abrir a tela”)

| Ação | Dono | Parceiro | Admin emp. | Atendente | Supervisor | Notas |
|------|------|----------|------------|-----------|------------|-------|
| Aceitar / responder ticket | | | | | | |
| Transferir ticket | | | | | | |
| Encerrar ticket | | | | | | |
| Ver todos os tickets da empresa | | | | | | `allTicket` |
| Criar conexão WhatsApp | | | | | | |
| Escolher Baileys vs Oficial | | | | | | |
| Criar usuário | | | | | | |
| Alterar permissões de usuário | | | | | | |
| Criar fila | | | | | | |
| Disparar campanha | | | | | | |
| Editar fluxo | | | | | | |
| Criar empresa-filha | | | | | | |
| Bloquear acesso de empresa | | | | | | |
| Criar whitelabel | | | | | | só plataforma |
| Calcular cobrança de parceiro | | | | | | |
| Ver faturas da empresa | | | | | | |
| Exportar contatos / relatórios | | | | | | |

## Flags e permissões observadas nesta sessão

Registrar strings reais vistas na UI/API:

```
permissions[]:
flags de usuário:
flags de plano/empresa:
```
