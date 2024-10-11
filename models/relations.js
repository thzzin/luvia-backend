const Contato = require("./Contato");
const Conversa = require("./Conversa");

// Relacionamento Contato -> Conversa (Um Contato tem muitas Conversas)
Contato.hasMany(Conversa, { foreignKey: "contato_id", as: "conversas" });

// Relacionamento Conversa -> Contato
Conversa.belongsTo(Contato, { foreignKey: "contato_id", as: "contato" });
