import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "deletedAt", {
      type: DataTypes.DATE,
      allowNull: true
    });
    await queryInterface.addColumn("Tickets", "deletedBy", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addColumn("Tickets", "deletedByName", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Tickets", "deletionReasonCategory", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Tickets", "deletionReason", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addIndex("Tickets", ["companyId", "deletedAt"], {
      name: "idx_tickets_company_deleted_at"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Tickets", "idx_tickets_company_deleted_at");
    await queryInterface.removeColumn("Tickets", "deletionReason");
    await queryInterface.removeColumn("Tickets", "deletionReasonCategory");
    await queryInterface.removeColumn("Tickets", "deletedByName");
    await queryInterface.removeColumn("Tickets", "deletedBy");
    await queryInterface.removeColumn("Tickets", "deletedAt");
  }
};
