/**
 * Auditoria de contatos por companyId e canonicalNumber.
 * Útil antes/depois da deduplicação (Fase 5 do plano contato único).
 *
 * Uso: npx ts-node src/database/scripts/auditContacts.ts [--company=<id>]
 *   ou: npm run db:audit-contacts [-- --company=1]
 */

import "dotenv/config";
import { QueryTypes } from "sequelize";
import sequelize from "../index";

interface TotalRow {
  companyId: number;
  total: string;
}

interface DuplicateRow {
  companyId: number;
  canonicalNumber: string;
  count: string;
}

const parseArgs = (): { companyId?: number } => {
  const args = process.argv.slice(2);
  let companyId: number | undefined;
  for (const arg of args) {
    if (arg === "--help") {
      console.log("\n📋  Auditoria de contatos\n");
      console.log("Uso: npx ts-node src/database/scripts/auditContacts.ts [--company=<id>]");
      console.log("  --company    Filtra por companyId.\n");
      process.exit(0);
    }
    if (arg.startsWith("--company=")) {
      const v = Number(arg.split("=")[1]);
      if (!Number.isFinite(v)) throw new Error(`Valor inválido: ${arg}`);
      companyId = v;
    }
  }
  return { companyId };
};

const run = async () => {
  const { companyId } = parseArgs();

  console.log("\n📋  Auditoria de contatos\n");
  if (companyId) console.log(`  Filtro: companyId = ${companyId}\n`);

  await sequelize.authenticate();

  const totalsSql = companyId
    ? `SELECT "companyId", COUNT(*) AS total FROM "Contacts" WHERE "companyId" = :companyId GROUP BY "companyId" ORDER BY "companyId"`
    : `SELECT "companyId", COUNT(*) AS total FROM "Contacts" GROUP BY "companyId" ORDER BY "companyId"`;
  const totalsReplacements: Record<string, unknown> = companyId ? { companyId } : {};

  const totals = await sequelize.query<TotalRow>(totalsSql, {
    type: QueryTypes.SELECT,
    replacements: totalsReplacements
  });

  const dupSql = companyId
    ? `SELECT "companyId", "canonicalNumber", COUNT(*) AS count FROM "Contacts" WHERE "canonicalNumber" IS NOT NULL AND "companyId" = :companyId GROUP BY "companyId", "canonicalNumber" HAVING COUNT(*) > 1 ORDER BY "companyId", COUNT(*) DESC`
    : `SELECT "companyId", "canonicalNumber", COUNT(*) AS count FROM "Contacts" WHERE "canonicalNumber" IS NOT NULL GROUP BY "companyId", "canonicalNumber" HAVING COUNT(*) > 1 ORDER BY "companyId", COUNT(*) DESC`;
  const dupReplacements: Record<string, unknown> = companyId ? { companyId } : {};

  const duplicates = await sequelize.query<DuplicateRow>(dupSql, {
    type: QueryTypes.SELECT,
    replacements: dupReplacements
  });

  console.log("  Totais por empresa:");
  let grandTotal = 0;
  for (const r of totals) {
    const n = Number(r.total);
    grandTotal += n;
    console.log(`    Empresa ${r.companyId}: ${n} contatos`);
  }
  if (totals.length > 1) console.log(`    Total geral: ${grandTotal}`);

  console.log("\n  Grupos duplicados (companyId + canonicalNumber com count > 1):");
  if (!duplicates.length) {
    console.log("    Nenhum.\n");
  } else {
    let extra = 0;
    for (const r of duplicates) {
      const c = Number(r.count);
      extra += c - 1;
      console.log(`    Empresa ${r.companyId} • ${r.canonicalNumber} • ${c} registros`);
    }
    console.log(`    Total de contatos em excesso (a remover na deduplicação): ${extra}\n`);
  }

  await sequelize.close();
  console.log("✅  Auditoria concluída.\n");
};

run().catch(async err => {
  console.error("❌ Erro:", err.message);
  await sequelize.close();
  process.exit(1);
});
