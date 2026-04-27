import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Plans", "useOpenAi", {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }),
      queryInterface.addColumn("Plans", "useIntegrations", {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Plans", "useOpenAi"),
      queryInterface.removeColumn("Plans", "useIntegrations")
    ]);
  }
};
