import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    /**
     * Atualiza isWhatsappValid=true para contatos que já têm tickets (conversas)
     * mas ainda têm isWhatsappValid=null (contatos criados antes da correção)
     */
    await queryInterface.sequelize.query(`
      UPDATE "Contacts" c
      SET 
        "isWhatsappValid" = true,
        "validatedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE 
        c."isWhatsappValid" IS NULL
        AND c."isGroup" = false
        AND c."channel" = 'whatsapp'
        AND EXISTS (
          SELECT 1 
          FROM "Tickets" t
          INNER JOIN "Whatsapps" w ON t."whatsappId" = w.id
          WHERE 
            t."contactId" = c.id
            AND t."companyId" = c."companyId"
            AND w."channel" = 'whatsapp'
          LIMIT 1
        );
    `);

    console.log("[Migration] Contatos com tickets atualizados: isWhatsappValid=true");
  },

  down: async (queryInterface: QueryInterface) => {
    // Não há rollback - a correção é permanente
    console.log("[Migration] Rollback não implementado - correção é permanente");
  }
};
