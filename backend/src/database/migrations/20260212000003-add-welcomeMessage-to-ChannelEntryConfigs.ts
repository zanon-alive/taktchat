import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn(
      "ChannelEntryConfigs",
      "welcomeMessage",
      {
        type: DataTypes.TEXT,
        allowNull: true
      }
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ChannelEntryConfigs", "welcomeMessage");
  }
};
