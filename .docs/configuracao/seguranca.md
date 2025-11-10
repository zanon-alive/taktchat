## Diretrizes de segurança

### Gestão de segredos

- Utilize `JWT_SECRET` e `JWT_REFRESH_SECRET` com 64+ caracteres aleatórios.
- Separe ambientes (`.env.development`, `.env.production`) e proteja-os com controle de acesso.
- Em produção, carregue segredos via variáveis de ambiente do orquestrador ou serviço de secrets.

### Autenticação e autorização

- Middleware `isAuth` valida JWTs e perfis; mantenha dependências atualizadas.
- Revise periodicamente perfis em `Roles` e permissões para evitar sobre-escalonamento.
- Configure expiração de tokens (`expiresIn`, `refreshExpiresIn`) conforme política interna.

### Comunicação segura

- Habilite HTTPS no frontend e backend (TLS terminando em proxy reverso, ex.: nginx).
- Para bancos gerenciados, defina `DB_SSL=true` e configure certificados confiáveis (`DB_SSL_REJECT_UNAUTHORIZED`).

### Proteção de dados

- Agende backups diários do volume `taktchat_postgres_data` (ver `operacao/backup-recuperacao.md`).
- Criptografe dumps sensíveis e armazene em local seguro.
- Restrinja acesso aos volumes `backend-private` (sessões WhatsApp).

### Monitoramento e alertas

- Ative integração com Sentry ou solução equivalente para capturar exceções.
- Utilize dashboards Redis/PostgreSQL para identificar filas represadas ou conexões inativas.
- Crie alertas em torno das métricas críticas: volume de mensagens, estado das filas, erros 5xx.

### Compliance

- Garanta consentimento de disparos e mantenha logs de opt-in/out.
- Atualize política de privacidade conforme legislações aplicáveis (LGPD, GDPR).

