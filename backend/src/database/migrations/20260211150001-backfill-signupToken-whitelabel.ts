import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM "Companies" WHERE type = 'whitelabel' AND "signupToken" IS NULL`
    );
    const companies = rows as { id: number }[];
    for (const c of companies) {
      const token = require("crypto").randomBytes(24).toString("hex");
      await queryInterface.sequelize.query(
        `UPDATE "Companies" SET "signupToken" = :token WHERE id = :id`,
        { replacements: { token, id: c.id } }
      );
    }
  },

  down: async () => {
    // Não remove os tokens gerados
  }
};
