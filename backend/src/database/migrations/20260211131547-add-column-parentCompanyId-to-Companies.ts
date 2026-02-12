import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar coluna parentCompanyId (nullable, FK para Companies)
    await queryInterface.addColumn("Companies", "parentCompanyId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "Companies",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    // Garantir que empresas existentes tenham parentCompanyId = null
    await queryInterface.sequelize.query(
      `UPDATE "Companies" SET "parentCompanyId" = NULL WHERE "parentCompanyId" IS NULL;`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover FK constraint primeiro
    await queryInterface.sequelize.query(
      `ALTER TABLE "Companies" DROP CONSTRAINT IF EXISTS "Companies_parentCompanyId_fkey";`
    );
    
    // Remover coluna
    return queryInterface.removeColumn("Companies", "parentCompanyId");
  }
};
