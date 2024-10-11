const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Conversa = require("./Conversation"); // Certifique-se de que este caminho está correto

const Contato = sequelize.define(
  "Contato",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Gera um UUID automaticamente
      primaryKey: true,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    phoneadmin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "contatos",
    timestamps: true,
  }
);

// Relacionamento Contato -> Conversa (Um Contato tem muitas Conversas)
Contato.hasMany(Conversa, { foreignKey: "contato_id", as: "conversas" });

module.exports = Contato;
