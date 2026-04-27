import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Whatsapps", "collectiveVacationEnd", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Whatsapps", "collectiveVacationMessage", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
      }),
      queryInterface.addColumn("Whatsapps", "collectiveVacationStart", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Whatsapps", "collectiveVacationEnd"),
      queryInterface.removeColumn("Whatsapps", "collectiveVacationMessage"),
      queryInterface.removeColumn("Whatsapps", "collectiveVacationStart")
    ]);
  }
};

