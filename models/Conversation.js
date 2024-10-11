const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Conversa = sequelize.define(
  "Conversa",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contato_id: {
      type: DataTypes.UUID, // UUID para se alinhar com o tipo em Contato
      allowNull: false,
      references: {
        model: "contatos", // Deve corresponder ao nome da tabela do modelo Contato
        key: "id",
      },
      onDelete: "CASCADE",
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

module.exports = Conversa;
