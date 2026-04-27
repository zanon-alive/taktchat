import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "lgpdAcceptedAt", {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "lgpdSendMessageAt", {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "lgpdAcceptedAt"),
      queryInterface.removeColumn("Tickets", "lgpdSendMessageAt")
    ]);
  }
};