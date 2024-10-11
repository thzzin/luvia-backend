// models/Contato.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Conversa = require("./Conversation");
const Admin = require("./Admin");

const Contato = sequelize.define(
  "Contato",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING, // Mantenha como STRING se você precisar armazenar números com prefixos
      primaryKey: true, // Define phone_number como chave primária
      allowNull: false,
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
      defaultValue: DataTypes.NOW, // Adiciona valor padrão de data/hora atual
    },
    phoneadmin: {
      type: DataTypes.STRING, // Mantenha como STRING se você precisar armazenar números com prefixos
      allowNull: true,
    },
  },
  {
    tableName: "contatos",
    timestamps: true,
  }
);

// Definindo o relacionamento Contato -> Conversas (Um para muitos)
Admin.hasMany(Contato, { foreignKey: "admin_id" });
Contato.belongsTo(Admin, { foreignKey: "admin_id" });

module.exports = Contato;
