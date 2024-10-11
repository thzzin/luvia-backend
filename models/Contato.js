const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Admin = require("./Admin");

const Contato = sequelize.define(
  "Contato",
  {
    id: {
      type: DataTypes.STRING, // ou DataTypes.INTEGER se preferir
      primaryKey: true,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Opcional, se você quiser garantir que os números de telefone sejam únicos
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

// Definindo o relacionamento Contato -> Admin (Um para muitos)
Admin.hasMany(Contato, { foreignKey: "admin_id" });
Contato.belongsTo(Admin, { foreignKey: "admin_id" });

module.exports = Contato;
