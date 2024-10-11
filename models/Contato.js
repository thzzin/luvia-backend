const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Contato = sequelize.define(
  "Contato",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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

module.exports = Contato;
