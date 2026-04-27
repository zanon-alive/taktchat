import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "integrationId", {
        type: DataTypes.INTEGER,
        references: { model: "QueueIntegrations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      }),
      queryInterface.addColumn("Whatsapps", "integrationId", {
        type: DataTypes.INTEGER,
        references: { model: "QueueIntegrations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "integrationId"),
      queryInterface.removeColumn("Whatsapps", "integrationId")
    ]);
  }
};