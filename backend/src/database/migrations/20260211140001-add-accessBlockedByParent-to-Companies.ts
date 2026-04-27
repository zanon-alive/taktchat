import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = (await queryInterface.describeTable("Companies")) as Record<string, unknown>;
    if ("accessBlockedByParent" in table) {
      return;
    }
    return queryInterface.addColumn("Companies", "accessBlockedByParent", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    const table = (await queryInterface.describeTable("Companies")) as Record<string, unknown>;
    if (!("accessBlockedByParent" in table)) {
      return;
    }
    return queryInterface.removeColumn("Companies", "accessBlockedByParent");
  }
};
