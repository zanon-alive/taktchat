import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Companies", "folderSize", {
                type: DataTypes.STRING,
                allowNull: true
            }),
            queryInterface.addColumn("Companies", "numberFileFolder", {
                type: DataTypes.STRING,
                allowNull: true
            }),
            queryInterface.addColumn("Companies", "updatedAtFolder", {
                type: DataTypes.STRING,
                allowNull: true
            })
        ]);
    },

    down: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Companies", "folderSize"),
            queryInterface.removeColumn("Companies", "numberFileFolder"),
            queryInterface.removeColumn("Companies", "updatedAtFolder")
        ]);
    }
};
