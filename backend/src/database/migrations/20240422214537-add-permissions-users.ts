import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "allowRealTime", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "disabled"
      }),
      queryInterface.addColumn("Users", "allowConnections", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "disabled"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "allowRealTime"),
      queryInterface.removeColumn("Users", "allowConnections")
    ]);
  }
};
