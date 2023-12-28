const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ADMIN'
    },
  }, {
  });
  return Admin;
};  
