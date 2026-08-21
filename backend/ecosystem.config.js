/**
 * Legado (nome "multipremium-back", cluster/auto).
 * Não usar em produção TaktChat: Baileys não convive com várias instâncias.
 * Exemplo vigente: ../ecosystem.config.cjs
 * Guia: ../.docs/infraestrutura/pm2-hibrido.md
 */
module.exports = [
  {
    script: "dist/server.js",
    name: "multipremium-back",
    exec_mode: "cluster",
    instances: "auto",
    cron_restart: "05 00 * * *",
    autorestart: true,
    watch: false,
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    env: {
      NODE_ENV: "production",
    },
  },
];
