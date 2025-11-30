import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("ConnectionLogs", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            whatsappId: {
                type: DataTypes.INTEGER,
                references: { model: "Whatsapps", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            companyId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            eventType: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Tipo do evento: qr_generated, connection_open, connection_close, etc",
            },
            eventData: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Dados completos do evento em JSON",
            },
            statusCode: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Código de status do erro (401, 428, 515, etc)",
            },
            errorMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Mensagem de erro do WhatsApp/Baileys",
            },
            diagnosis: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Diagnóstico automático do problema",
            },
            suggestions: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Array de sugestões para resolver o problema",
            },
            severity: {
                type: DataTypes.ENUM("info", "warning", "error", "critical"),
                defaultValue: "info",
                allowNull: false,
                comment: "Severidade do evento",
            },
            timestamp: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
                comment: "Timestamp do evento",
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("ConnectionLogs");
    },
};
