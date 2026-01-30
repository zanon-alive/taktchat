/**
 * Script para excluir tickets, mensagens e contatos da empresa 1.
 * Ordem respeitando FKs: mensagens → refs a ticket → schedules → tickets → refs a contato → contatos.
 *
 * Uso: npx ts-node src/database/scripts/deleteCompany1Data.ts
 *   ou: npm run db:delete-company1
 */

import "dotenv/config";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../index";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import TicketTag from "../../models/TicketTag";
import LogTicket from "../../models/LogTicket";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import TicketNote from "../../models/TicketNote";
import Schedule from "../../models/Schedule";
import ContactTag from "../../models/ContactTag";
import ContactWallet from "../../models/ContactWallet";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWhatsappLabel from "../../models/ContactWhatsappLabel";
import CampaignShipping from "../../models/CampaignShipping";
import DialogChatBots from "../../models/DialogChatBots";

const COMPANY_ID = 1;

const log = (msg: string, detail?: number | string) => {
  console.log(`  ${msg}${detail !== undefined ? `: ${detail}` : ""}`);
};

const tableExists = async (name: string): Promise<boolean> => {
  const rows = await sequelize.query<{ n: number }>(
    `SELECT 1 AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :name`,
    { replacements: { name }, type: QueryTypes.SELECT }
  );
  return Array.isArray(rows) && rows.length > 0;
};

const run = async () => {
  console.log(`\n🗑️  Excluindo tickets, mensagens e contatos da empresa ${COMPANY_ID}...\n`);

  await sequelize.authenticate();

  const ticketIds = await Ticket.findAll({
    where: { companyId: COMPANY_ID },
    attributes: ["id"],
    raw: true
  }).then(rows => rows.map(r => r.id));

  const contactIds = await Contact.findAll({
    where: { companyId: COMPANY_ID },
    attributes: ["id"],
    raw: true
  }).then(rows => rows.map(r => r.id));

  log("Tickets a remover", ticketIds.length);
  log("Contatos a remover", contactIds.length);

  if (ticketIds.length === 0 && contactIds.length === 0) {
    console.log("\n✅ Nenhum ticket ou contato da empresa 1 encontrado. Nada a excluir.");
    await sequelize.close();
    process.exit(0);
  }

  const hasContactWhatsappLabels = await tableExists("ContactWhatsappLabels");
  const hasDialogChatBots = await tableExists("DialogChatBots");
  if (!hasContactWhatsappLabels) log("ContactWhatsappLabels (tabela inexistente, pulando)", "—");
  if (!hasDialogChatBots) log("DialogChatBots (tabela inexistente, pulando)", "—");

  const t = await sequelize.transaction();

  try {
    // 1. Mensagens (companyId)
    const d1 = await Message.destroy({
      where: { companyId: COMPANY_ID },
      transaction: t
    });
    log("Mensagens excluídas", d1);

    if (ticketIds.length > 0) {
      // 2. Refs a ticket
      const d2a = await TicketTag.destroy({ where: { ticketId: { [Op.in]: ticketIds } }, transaction: t });
      const d2b = await LogTicket.destroy({ where: { ticketId: { [Op.in]: ticketIds } }, transaction: t });
      const d2c = await TicketTraking.destroy({ where: { ticketId: { [Op.in]: ticketIds } }, transaction: t });
      const d2d = await UserRating.destroy({ where: { ticketId: { [Op.in]: ticketIds } }, transaction: t });
      log("TicketTag / LogTicket / TicketTraking / UserRating", [d2a, d2b, d2c, d2d].join(", "));

      // 3. TicketNote (ticketId ou contactId)
      const d3 = await TicketNote.destroy({
        where: {
          [Op.or]: [
            { ticketId: { [Op.in]: ticketIds } },
            { contactId: { [Op.in]: contactIds } }
          ]
        },
        transaction: t
      });
      log("TicketNote excluídos", d3);
    }

    // 4. Schedules (companyId)
    const d4 = await Schedule.destroy({
      where: { companyId: COMPANY_ID },
      transaction: t
    });
    log("Schedules excluídos", d4);

    // 5. Tickets
    const d5 = await Ticket.destroy({
      where: { companyId: COMPANY_ID },
      transaction: t
    });
    log("Tickets excluídos", d5);

    if (contactIds.length > 0) {
      const whereContact = { where: { contactId: { [Op.in]: contactIds } }, transaction: t };
      const d6a = await ContactTag.destroy(whereContact);
      const d6b = await ContactWallet.destroy(whereContact);
      const d6c = await ContactCustomField.destroy(whereContact);
      const d6d = hasContactWhatsappLabels ? await ContactWhatsappLabel.destroy(whereContact) : 0;
      const d6e = await CampaignShipping.destroy(whereContact);
      const d6f = hasDialogChatBots ? await DialogChatBots.destroy(whereContact) : 0;
      log("ContactTag / ContactWallet / ContactCustomField / ContactWhatsappLabel / CampaignShipping / DialogChatBots", [d6a, d6b, d6c, d6d, d6e, d6f].join(", "));
    }

    // 7. Contatos
    const d7 = await Contact.destroy({
      where: { companyId: COMPANY_ID },
      transaction: t
    });
    log("Contatos excluídos", d7);

    await t.commit();
    console.log("\n✅ Exclusão concluída com sucesso.");
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
