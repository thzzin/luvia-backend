const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Contato = require("./Contato");

const Conversa = sequelize.define(
  "Conversa",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contato_id: {
      type: DataTypes.UUID, // Corrigir para UUID em vez de VARCHAR
      allowNull: false,
      references: {
        model: Contato, // Referencia a tabela 'contatos'
        key: "id", // O campo 'id' da tabela 'contatos'
      },
      onDelete: "CASCADE", // Opcional, dependendo do comportamento desejado
      onUpdate: "CASCADE",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "conversas",
    timestamps: true,
  }
);

Conversa.belongsTo(Contato, { foreignKey: "contato_id", as: "contato" });

module.exports = Conversa;
