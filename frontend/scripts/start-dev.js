const { spawn } = require("child_process");

const env = {
  ...process.env,
  BROWSER: "none",
};

console.log("[start-dev] Iniciando frontend sem abrir o navegador padrão…");

const child = spawn("craco", ["start"], {
  shell: true,
  stdio: "inherit",
  env,
});

child.on("exit", code => {
  if (typeof code === "number") {
    process.exit(code);
    return;
  }
  process.exit(1);
});

child.on("error", err => {
  console.error(`[start-dev] Falha ao iniciar o craco start: ${err.message}`);
  process.exit(1);
});

