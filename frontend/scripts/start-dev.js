const { spawn } = require("child_process");

const env = {
  ...process.env,
  BROWSER: "none",
};

if (!env.NODE_OPTIONS || !String(env.NODE_OPTIONS).includes("max-old-space-size")) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--max-old-space-size=4096"]
    .filter(Boolean)
    .join(" ");
}

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

