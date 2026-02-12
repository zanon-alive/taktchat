import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar coluna companyId (nullable inicialmente para migração suave)
    await queryInterface.addColumn("Plans", "companyId", {
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

    // Atualizar planos existentes com companyId = 1 (empresa plataforma)
    await queryInterface.sequelize.query(
      `UPDATE "Plans" SET "companyId" = 1 WHERE "companyId" IS NULL;`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover FK constraint primeiro
    await queryInterface.sequelize.query(
      `ALTER TABLE "Plans" DROP CONSTRAINT IF EXISTS "Plans_companyId_fkey";`
    );
    
    // Remover coluna
    return queryInterface.removeColumn("Plans", "companyId");
  }
};
