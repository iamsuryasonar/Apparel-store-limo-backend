const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        keyword: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mrp: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        selling_price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('IN-STOCK', 'OUT-OF-STOCK'),
            allowNull: false,
            defaultValue: 'IN-STOCK'
        },
    }, {
    });
    Product.associate = function (models) {
    };
    return Product;
};  