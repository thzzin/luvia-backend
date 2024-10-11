// models/Message.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Conexão com o Sequelize
const Conversa = require("../models/Conversation");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phonecontact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idConversa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversas",
        key: "id", // Referencia o id da tabela conversas
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message_type: {
      type: DataTypes.ENUM("sent", "received"), // Definindo o tipo de mensagem
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

// Relacionamento Message -> Conversa (Um para muitos)
Conversa.hasMany(Message, { foreignKey: "conversation_id" });
Message.belongsTo(Conversa, { foreignKey: "conversation_id" });

module.exports = Message;
