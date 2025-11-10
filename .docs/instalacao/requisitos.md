## Requisitos de ambiente

### Sistemas operacionais suportados

- Linux (Ubuntu 22.04+ ou Debian 12) — recomendado para produção.
- macOS 13+ — suportado para desenvolvimento.
- Windows 11 — utilizar WSL2 com distribuição Ubuntu.

### Ferramentas obrigatórias

- Node.js 22.18.0 (verifique com `node -v`).
- npm 10 ou superior.
- Docker 26+ e Docker Compose v2.
- PostgreSQL 15 (pode ser container dedicado ou serviço gerenciado).
- Redis 6.2.
- ffmpeg (para transcodificação de mídia) — disponível no host ou imagem Docker.

### Recursos mínimos recomendados

- CPU: 4 vCPUs.
- Memória: 8 GB RAM (12 GB para ambientes com alto volume de campanhas).
- Armazenamento: 50 GB SSD (separar volumes para banco, sessões e uploads).

### Dependências externas opcionais

- Credenciais Google Dialogflow/Gemini para automação inteligente.
- Conta OpenAI configurada via `OPENAI_API_KEY`.
- Serviço SMTP confiável para disparo de emails (`MAIL_HOST`, `MAIL_PORT`, etc.).

### Controle de versões

- Backend/Frontend encontram-se na versão `2.2.2v-26`.
- Documentar mudanças em `anexos/notas-de-versao.md` ao atualizar dependências críticas.

