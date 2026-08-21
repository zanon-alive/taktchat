/**
 * PM2 — exemplo híbrido (NÃO é o processo da VPS hoje).
 *
 * VPS atual: Docker Swarm + volumes (`14_taktchat.yml`).
 * Este arquivo serve para um host em que:
 *   - Postgres e Redis continuam no Docker (portas só em 127.0.0.1)
 *   - Traefik/Nginx faz HTTPS
 *   - Node sobe com PM2
 *
 * Uso (na pasta do repositório):
 *   cd backend && npm ci --legacy-peer-deps && npm run build && npx sequelize db:migrate
 *   cd ../frontend && npm ci --legacy-peer-deps && npm run build
 *   pm2 start ecosystem.config.cjs
 *   # Frontend Node (opcional): pm2 start taktchat-frontend
 *
 * Baileys: instances = 1 (sessão em disco não escala em cluster).
 * Env: backend/.env (env_file). Copie de backend/.env.example.
 *
 * Guia: .docs/infraestrutura/pm2-hibrido.md
 */
module.exports = {
  apps: [
    {
      name: "taktchat-backend",
      cwd: "./backend",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 10000,
      listen_timeout: 15000,
      merge_logs: true,
      time: true,
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: "8080",
      },
    },
    {
      name: "taktchat-frontend",
      cwd: "./frontend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      merge_logs: true,
      time: true,
      autostart: false,
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
