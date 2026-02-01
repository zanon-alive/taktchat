/**
 * Script para excluir contatos que não possuem nenhum atendimento (ticket).
 *
 * Uso: npx ts-node src/database/scripts/deleteContactsWithoutTickets.ts [opções]
 *   ou: npm run db:delete-contacts-without-tickets
 *
 * Opções:
 *   --company=<id>  Filtra por companyId (obrigatório em modo apply).
 *   --apply         Executa a exclusão (padrão: dry-run, apenas exibe o que seria feito).
 *   --limit=<n>     Limita quantos contatos excluir (útil para testes).
 *   --help          Exibe esta ajuda.
 */

import "dotenv/config";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../index";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import ContactWallet from "../../models/ContactWallet";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWhatsappLabel from "../../models/ContactWhatsappLabel";
import CampaignShipping from "../../models/CampaignShipping";
import DialogChatBots from "../../models/DialogChatBots";
import fs from "fs";
import path from "path";

interface Options {
  companyId?: number;
  apply: boolean;
  limit?: number;
}

const log = (msg: string, detail?: number | string) => {
  console.log(`  ${msg}${detail !== undefined ? `: ${detail}` : ""}`);
};

const usage = () => {
  console.log(`
Script para excluir contatos sem atendimentos (tickets)

Uso: npx ts-node src/database/scripts/deleteContactsWithoutTickets.ts [opções]

Opções:
  --company=<id>  Filtra por companyId (ex.: --company=1)
  --apply         Executa a exclusão. Sem isso, é dry-run (apenas exibe o que seria feito).
  --limit=<n>     Limita quantos contatos excluir (útil para testes).
  --help          Exibe esta ajuda.

Exemplos:
  npx ts-node src/database/scripts/deleteContactsWithoutTickets.ts --company=1
    → Lista contatos sem tickets da empresa 1 (dry-run).

  npx ts-node src/database/scripts/deleteContactsWithoutTickets.ts --company=1 --apply
    → Exclui contatos sem tickets da empresa 1.
`);
};

const parseArgs = (): Options => {
  const args = process.argv.slice(2);
  const options: Options = { apply: false };

  for (const arg of args) {
    if (arg === "--help") {
      usage();
      process.exit(0);
    }
    if (arg === "--apply") {
      options.apply = true;
      continue;
    }
    if (arg.startsWith("--company=")) {
      const value = Number(arg.split("=")[1]);
      if (!Number.isFinite(value)) {
        throw new Error(`Valor inválido para --company: ${arg}`);
      }
      options.companyId = value;
      continue;
    }
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error(`Valor inválido para --limit: ${arg}`);
      }
      options.limit = value;
      continue;
    }
    throw new Error(`Argumento desconhecido: ${arg}`);
  }

  return options;
};

const tableExists = async (name: string): Promise<boolean> => {
  const rows = await sequelize.query<{ n: number }>(
    `SELECT 1 AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :name`,
    { replacements: { name }, type: QueryTypes.SELECT }
  );
  return Array.isArray(rows) && rows.length > 0;
};

const removeContactFiles = (contact: Contact): void => {
  try {
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
    const rel = path.posix.join(`company${contact.companyId}`, "contacts", String((contact as any).uuid || ""));
    const target = path.resolve(publicFolder, rel);

    if (target.startsWith(publicFolder) && fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  } catch (e) {
    console.error(`    [aviso] Erro ao remover arquivos do contato ${contact.id}:`, (e as Error).message);
  }
};

const run = async () => {
  const options = parseArgs();

  if (options.apply && !options.companyId) {
    console.error("\n❌ Erro: --company=<id> é obrigatório quando usar --apply (por segurança).\n");
    process.exit(1);
  }

  console.log("\n🗑️  Excluir contatos sem atendimentos (tickets)\n");
  if (options.apply) {
    console.log("  Modo: APLICAR alterações");
  } else {
    console.log("  Modo: DRY-RUN (nenhuma alteração será feita; use --apply para executar)");
  }
  if (options.companyId) {
    log("CompanyId", options.companyId);
  } else {
    log("CompanyId", "todas (somente dry-run)");
  }
  if (options.limit) {
    log("Limit", options.limit);
  }
  console.log("");

  await sequelize.authenticate();

  const replacements: Record<string, unknown> = {};
  let whereClause = `
    c.id NOT IN (SELECT "contactId" FROM "Tickets" WHERE "contactId" IS NOT NULL)
    AND (c."isGroup" IS NULL OR c."isGroup" = false)
  `;
  if (options.companyId) {
    whereClause += ' AND c."companyId" = :companyId';
    replacements.companyId = options.companyId;
  }

  const limitSql = options.limit ? ` LIMIT ${options.limit}` : "";

  const countSql = `
    SELECT COUNT(*) AS total
    FROM "Contacts" c
    WHERE ${whereClause}
  `;

  const countResult = await sequelize.query<{ total: string }>(countSql, {
    type: QueryTypes.SELECT,
    replacements
  });
  const total = Number(countResult[0]?.total ?? 0);

  if (total === 0) {
    console.log("✅ Nenhum contato sem ticket encontrado.\n");
    await sequelize.close();
    process.exit(0);
  }

  log("Contatos sem ticket encontrados", total);
  console.log("");

  const selectSql = `
    SELECT c.id, c."companyId", c.name, c.number, c.uuid
    FROM "Contacts" c
    WHERE ${whereClause}
    ORDER BY c.id
    ${limitSql}
  `;

  const contacts = await sequelize.query<any>(selectSql, {
    type: QueryTypes.SELECT,
    replacements
  });

  if (!options.apply) {
    console.log("  (dry-run) Contatos que seriam excluídos (primeiros 20):");
    contacts.slice(0, 20).forEach((c: any) => {
      console.log(`    id=${c.id} company=${c.companyId} number=${c.number} name=${c.name || "-"}`);
    });
    if (contacts.length > 20) {
      console.log(`    ... e mais ${contacts.length - 20} contatos`);
    }
    console.log("\n  Execute com --apply --company=<id> para excluir.\n");
    await sequelize.close();
    process.exit(0);
  }

  const contactIds = contacts.map((c: any) => c.id);
  const hasContactWhatsappLabels = await tableExists("ContactWhatsappLabels");
  const hasDialogChatBots = await tableExists("DialogChatBots");

  if (!hasContactWhatsappLabels) log("ContactWhatsappLabels (tabela inexistente, pulando)", "—");
  if (!hasDialogChatBots) log("DialogChatBots (tabela inexistente, pulando)", "—");

  const t = await sequelize.transaction();

  try {
    const whereContact = { where: { contactId: { [Op.in]: contactIds } }, transaction: t };

    const d1 = await ContactTag.destroy(whereContact);
    const d2 = await ContactWallet.destroy(whereContact);
    const d3 = await ContactCustomField.destroy(whereContact);
    const d4 = await CampaignShipping.destroy(whereContact);
    const d5 = hasContactWhatsappLabels ? await ContactWhatsappLabel.destroy(whereContact) : 0;
    const d6 = hasDialogChatBots ? await DialogChatBots.destroy(whereContact) : 0;

    log("ContactTag excluídos", d1);
    log("ContactWallet excluídos", d2);
    log("ContactCustomField excluídos", d3);
    log("CampaignShipping excluídos", d4);
    if (hasContactWhatsappLabels) log("ContactWhatsappLabel excluídos", d5);
    if (hasDialogChatBots) log("DialogChatBots excluídos", d6);

    for (const c of contacts) {
      const contact = await Contact.findByPk(c.id);
      if (contact) {
        removeContactFiles(contact);
      }
    }

    const d7 = await Contact.destroy({
      where: { id: { [Op.in]: contactIds } },
      transaction: t
    });
    log("Contatos excluídos", d7);

    await t.commit();
    console.log("\n✅ Exclusão concluída com sucesso.\n");
  } catch (e) {
    await t.rollback();
    console.error("\n❌ Erro na exclusão:", e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
