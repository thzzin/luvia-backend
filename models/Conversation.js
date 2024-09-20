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
    type: DataTypes.STRING, // Deve ser STRING para corresponder ao phone_number
    allowNull: false,
    references: {
      model: 'contatos',
      key: 'phone_number', // Referencia phone_number como chave primária
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phoneadmin: {
    type: DataTypes.STRING, // Mantenha como STRING se você precisar armazenar números com prefixos
    allowNull: true,
  },
  idConversation: {
    type: DataTypes.STRING, // Mantenha como STRING se você precisar armazenar números com prefixos
    allowNull: true,
  }
}, {
  tableName: 'conversas',
  timestamps: true,
});

Contato.hasMany(Conversa, { foreignKey: 'contato_id' });
Conversa.belongsTo(Contato, { foreignKey: 'contato_id' });

module.exports = Conversa;
