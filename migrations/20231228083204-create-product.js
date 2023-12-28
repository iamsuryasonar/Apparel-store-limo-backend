'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mrp: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      selling_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('IN-STOCK', 'OUT-OF-STOCK'),
        allowNull: false,
        defaultValue: 'IN-STOCK',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  },
};
