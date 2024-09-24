const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')
const Conversa = require('./Conversation')
const ConversaEtiqueta = require('./ConversaEtiqueta')

const Etiquetas = sequelize.define('Etiquetas', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      adminId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      color:{
        type: DataTypes.STRING,
        allowNull: true,
      }
}, {
    tableName: 'etiquetas',
    timestamps: true, 
  })
  Etiquetas.belongsToMany(Conversa, {
    through: ConversaEtiqueta,
    foreignKey: 'etiqueta_id',
    otherKey: 'conversa_id',
    as: 'conversas',
  });
  module.exports = Etiquetas;
