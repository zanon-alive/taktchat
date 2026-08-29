import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "anonymizedAt", {
      type: DataTypes.DATE,
      allowNull: true
    });
    await queryInterface.addColumn(
      "CompaniesSettings",
      "hiddenTicketRetentionDays",
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn(
      "CompaniesSettings",
      "hiddenTicketRetentionDays"
    );
    await queryInterface.removeColumn("Tickets", "anonymizedAt");
  }
};
