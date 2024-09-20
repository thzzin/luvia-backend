// models/Admin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phone:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  acessToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idNumero: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'admins',
  timestamps: true,
});

module.exports = Admin;
