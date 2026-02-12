import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar coluna type como VARCHAR temporariamente (Sequelize não suporta ENUM direto)
    await queryInterface.addColumn("Companies", "type", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "direct"
    });

    // Atualizar empresa plataforma (id = 1) para type = 'platform'
    await queryInterface.sequelize.query(
      `UPDATE "Companies" SET "type" = 'platform' WHERE "id" = 1;`
    );

    // Criar constraint CHECK para garantir valores válidos
    await queryInterface.sequelize.query(
      `ALTER TABLE "Companies" ADD CONSTRAINT "Companies_type_check" 
       CHECK ("type" IN ('platform', 'direct', 'whitelabel'));`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE "Companies" DROP CONSTRAINT IF EXISTS "Companies_type_check";`
    );
    
    // Remover coluna
    return queryInterface.removeColumn("Companies", "type");
  }
};
