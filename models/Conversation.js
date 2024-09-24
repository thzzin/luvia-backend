const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Contato = require('./Contato');

const Conversa = sequelize.define('Conversa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  contato_id: {
    type: DataTypes.STRING, 
    allowNull: false,
    references: {
      model: 'contatos',
      key: 'phone_number', 
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phoneadmin: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  idConversation: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), 
    allowNull: true,
  }
}, {
  tableName: 'conversas',
  timestamps: true,
});

Contato.hasMany(Conversa, { foreignKey: 'contato_id' });
Conversa.belongsTo(Contato, { foreignKey: 'contato_id' });

module.exports = Conversa;
