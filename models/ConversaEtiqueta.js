const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ConversaEtiqueta = sequelize.define(
  "ConversaEtiqueta",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversas",
        key: "id",
      },
    },
    etiqueta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "etiquetas",
        key: "id",
      },
    },
  },
  {
    tableName: "conversa_etiquetas",
    timestamps: true,
  }
);

module.exports = ConversaEtiqueta;
