import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "userClosePendingTicket", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "enabled"
      }),
      queryInterface.addColumn("Users", "showDashboard", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "disabled"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "userClosePendingTicket"),
      queryInterface.removeColumn("Users", "showDashboard")
    ]);
  }
};
