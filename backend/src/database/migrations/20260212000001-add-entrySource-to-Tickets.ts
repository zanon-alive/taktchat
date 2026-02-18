import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "entrySource", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "whatsapp"
    });
    await queryInterface.sequelize.query(`
      UPDATE "Tickets" SET "entrySource" = "channel"
      WHERE "channel" IS NOT NULL AND "channel" != '';
    `);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "entrySource");
  }
};
