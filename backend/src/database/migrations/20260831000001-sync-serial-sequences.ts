import { QueryInterface } from "sequelize";

const TABLES = [
  "Companies",
  "Users",
  "CompaniesSettings",
  "Plans",
  "Queues",
  "Licenses"
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `SELECT setval(
          pg_get_serial_sequence('"${table}"', 'id'),
          (SELECT COALESCE(MAX("id"), 1) FROM "${table}"),
          (SELECT EXISTS (SELECT 1 FROM "${table}"))
        )`
      );
    }
  },

  down: async () => {
    // Sequences alinhadas ao MAX(id) nao precisam de rollback.
  }
};
