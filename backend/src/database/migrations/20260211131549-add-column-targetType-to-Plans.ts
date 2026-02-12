import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar coluna targetType
    await queryInterface.addColumn("Plans", "targetType", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "direct"
    });

    // Atualizar planos existentes para targetType = 'direct'
    await queryInterface.sequelize.query(
      `UPDATE "Plans" SET "targetType" = 'direct' WHERE "targetType" IS NULL OR "targetType" = '';`
    );

    // Criar constraint CHECK para garantir valores válidos
    await queryInterface.sequelize.query(
      `ALTER TABLE "Plans" ADD CONSTRAINT "Plans_targetType_check" 
       CHECK ("targetType" IN ('direct', 'whitelabel'));`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE "Plans" DROP CONSTRAINT IF EXISTS "Plans_targetType_check";`
    );
    
    // Remover coluna
    return queryInterface.removeColumn("Plans", "targetType");
  }
};
