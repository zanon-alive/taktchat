import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Licenses", "activatedAt", {
        type: DataTypes.DATE,
        allowNull: true
      }),
      queryInterface.addColumn("Licenses", "paidMonths", {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      })
    ]).then(() => {
      return queryInterface.sequelize.query(`
        UPDATE "Licenses"
        SET "activatedAt" = COALESCE("startDate", "createdAt")
        WHERE "activatedAt" IS NULL
      `);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Licenses", "activatedAt"),
      queryInterface.removeColumn("Licenses", "paidMonths")
    ]);
  }
};
