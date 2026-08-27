import { QueryInterface, QueryTypes } from "sequelize";

const COMPANY_ID = 1;

async function findSettingId(queryInterface: QueryInterface, key: string) {
  const rows = (await queryInterface.sequelize.query(
    `SELECT id FROM "Settings" WHERE key = :key AND "companyId" = :companyId LIMIT 1`,
    {
      replacements: { key, companyId: COMPANY_ID },
      type: QueryTypes.SELECT
    }
  )) as Array<{ id: number }>;
  return rows[0]?.id;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();

    const widgetId = await findSettingId(queryInterface, "enableSiteChatWidget");
    if (widgetId) {
      await queryInterface.sequelize.query(
        `UPDATE "Settings" SET value = 'enabled', "updatedAt" = :now WHERE id = :id`,
        { replacements: { now, id: widgetId } }
      );
    } else {
      await queryInterface.bulkInsert("Settings", [
        {
          key: "enableSiteChatWidget",
          value: "enabled",
          companyId: COMPANY_ID,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }

    const numberId = await findSettingId(queryInterface, "supportWhatsAppNumber");
    if (!numberId) {
      await queryInterface.bulkInsert("Settings", [
        {
          key: "supportWhatsAppNumber",
          value: "5514996870843",
          companyId: COMPANY_ID,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const widgetId = await findSettingId(queryInterface, "enableSiteChatWidget");
    if (widgetId) {
      await queryInterface.sequelize.query(
        `UPDATE "Settings" SET value = 'disabled', "updatedAt" = :now WHERE id = :id`,
        { replacements: { now: new Date(), id: widgetId } }
      );
    }
  }
};
