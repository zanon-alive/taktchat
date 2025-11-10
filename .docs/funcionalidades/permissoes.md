## Permissões e perfis

### Estrutura

- Perfis (`Roles`) definem escopo de acesso para usuários.
- Permissões granulares controlam visibilidade de menus, ações (ex.: exportar dados, gerenciar empresas) e limites operacionais.
- Middleware backend garante autorização antes de executar endpoints sensíveis.

### Perfis sugeridos

- **Administrador Global**: acesso completo, gestão de empresas e integrações.
- **Supervisor**: gerencia usuários, campanhas e monitoramento.
- **Atendente**: acesso a tickets, envio de mensagens, uso limitado de campanhas.
- **Financeiro/Relatórios**: leitura de dashboards e exportações.

### Controles destacados

- Bloqueio de ações críticas (ex.: exclusão de empresas) por duplo fator administrativo.
- Limites de campanhas por perfil (consultar política vigente em `legacy/PERMISSIONS-*.md`).
- Auditoria de alterações: registrar quem modificou permissões e quando.

### Implementação técnica

- Tabela `Permissions` vinculada a `RolesPermissions` e `Users`.
- Frontend consome escopos no login e oculta componentes conforme necessário.
- Serviços backend verificam permissões antes de executar jobs (ex.: disparos em massa, acesso a dados sensíveis).

### Referências históricas

- `PERMISSIONS-PHASE-1-COMPLETE.md`
- `PERMISSIONS-PHASE-2-COMPLETE.md`
- `PERMISSIONS-COMPLETE-FINAL.md`

Esses documentos descrevem a evolução do modelo e podem ser consultados para entender decisões anteriores.

