const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CUSTOMER'
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
  });
  // Customer.associate = function (models) {
  //   Customer.hasMany(models.Cart);
  // };
  return Customer;
};

