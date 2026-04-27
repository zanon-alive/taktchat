import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const plansTable = (await queryInterface.describeTable("Plans")) as Record<string, unknown>;

      // Garantir coluna (idempotente: não quebrar se já existir)
      if (!("companyId" in plansTable)) {
        await queryInterface.addColumn(
          "Plans",
          "companyId",
          {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          { transaction: t }
        );
      }

      // Garantir existência da empresa plataforma (id=1) antes do backfill/FK
      await queryInterface.sequelize.query(
        `
        INSERT INTO "Companies" ("id", "name", "type", "createdAt", "updatedAt")
        VALUES (1, 'Plataforma', 'platform', NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
        `,
        { transaction: t }
      );

      // Normalizar dados: qualquer companyId inválido vira 1 (empresa plataforma)
      await queryInterface.sequelize.query(
        `
        UPDATE "Plans" p
        SET "companyId" = 1
        WHERE p."companyId" IS NULL
           OR NOT EXISTS (
             SELECT 1 FROM "Companies" c WHERE c."id" = p."companyId"
           );
        `,
        { transaction: t }
      );

      // Adicionar FK apenas se ainda não existir (idempotente)
      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'Plans_companyId_fkey'
          ) THEN
            ALTER TABLE "Plans"
              ADD CONSTRAINT "Plans_companyId_fkey"
              FOREIGN KEY ("companyId")
              REFERENCES "Companies" ("id")
              ON UPDATE CASCADE
              ON DELETE SET NULL;
          END IF;
        END
        $$;
        `,
        { transaction: t }
      );
    });
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
