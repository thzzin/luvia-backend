const Contato = require("./Contato");
const Conversa = require("./Conversa");
const Message = require("./Message");

// Relacionamento Contato -> Conversa (Um Contato tem muitas Conversas)
Contato.hasMany(Conversa, { foreignKey: "contato_id", as: "conversas" });

// Relacionamento Conversa -> Contato
Conversa.belongsTo(Contato, { foreignKey: "contato_id", as: "contato" });

// Relacionamento Conversa -> Message (Uma Conversa tem muitas Mensagens)
Conversa.hasMany(Message, { foreignKey: "conversation_id", as: "messages" });

// Relacionamento Message -> Conversa
Message.belongsTo(Conversa, { foreignKey: "conversation_id", as: "conversa" });

module.exports = {
  Contato,
  Conversa,
  Message,
};
