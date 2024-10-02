const Admin = require("../models/Admin"); // Certifique-se de que o modelo Admin esteja importado corretamente
//const sequelize = require('../config/db'); // Caminho para o arquivo onde sequelize está configurado
const Message = require("../models/Message"); // Importe o modelo correto
const Conversa = require("../models/Conversation");
const Contato = require("../models/Contato");
const Etiquetas = require("../models/Etiquetas");

async function getEtiquetas(adminId) {
  const admin = await Admin.findByPk(adminId);

  if (!admin) {
    throw new Error("Administrador não encontrado.");
  }

  const etiquetas = await Etiquetas.findOne({ where: { adminId } });
}

async function getInfos(adminId) {
  const admin = await Admin.findByPk(adminId);

  if (!admin) {
    throw new Error("Administrador não encontrado.");
  }

  return admin;
}

async function saveProfile(profile) {
  try {
    // Extraia os dados relevantes do profile
    const { pageInfo } = profile;
    const cargo = pageInfo.role; // Atualiza o cargo com o role do profile
    const status = pageInfo.accounts[0]?.status; // Pega o status do primeiro item de accounts
    const accountId = pageInfo.accounts[0]?.id?.toString(); // Pega o id do primeiro item de accounts e converte para string
    const email = pageInfo.email; // Usa o email para encontrar o Admin correspondente

    // Busca o Admin pelo email
    const admin = await Admin.findOne({ where: { email } });

    // Verifica se o Admin existe, se não, lança um erro
    if (!admin) {
      throw new Error("Admin não encontrado para o email fornecido.");
    }

    // Atualiza apenas os campos específicos
    await admin.update({
      cargo,
      status,
      accountId,
    });

    console.log("Admin data updated successfully.");
    return admin;
  } catch (error) {
    console.error("Error saving profile data:", error.message);
    throw error;
  }
}

async function getContatos(phoneNumber) {
  try {
    // 1. Buscar o Admin pelo número de telefone
    const admin = await Admin.findOne({ where: { phone: phoneNumber } });

    // 2. Verificar se o Admin existe
    if (!admin) {
      throw new Error("Admin não encontrado");
    }

    // 3. Buscar os Contatos associados ao Admin
    const contatos = await Contato.findAll({
      where: { phoneadmin: phoneNumber },
    });
    // 4. Retornar os contatos encontrados
    return contatos;
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    throw error; // Repassa o erro para ser tratado em outro lugar
  }
}

async function getConversation(adminPhone) {
  const phoneNumber = adminPhone;
  try {
    // 1. Buscar o Admin pelo número de telefone
    const admin = await Admin.findOne({ where: { phone: adminPhone } });

    // 2. Verificar se o Admin existe
    if (!admin) {
      throw new Error("Admin não encontrado");
    }

    // 3. Buscar todos os Contatos associados ao Admin
    const contatos = await Contato.findAll({
      where: { phoneadmin: phoneNumber },
    });

    // 4. Extrair os IDs dos Contatos
    const contatoIds = contatos.map((contato) => contato.phone_number);

    // 5. Buscar as Conversas associadas aos contatos do Admin
    const conversas = await Conversa.findAll({
      where: { contato_id: contatoIds },
    });

    // 6. Para cada conversa, buscar a última mensagem e o contato associado
    const conversasComDetalhes = await Promise.all(
      conversas.map(async (conversa) => {
        const lastMessage = await Message.findOne({
          where: { conversation_id: conversa.id },
          order: [["createdAt", "DESC"]], // Ordena para pegar a última mensagem
        });

        // Busca o contato associado à conversa
        const contato = await Contato.findOne({
          where: { phone_number: conversa.contato_id },
        });

        return {
          id: conversa.id,
          contato_id: conversa.contato_id,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                type: lastMessage.type, // Incluindo o tipo da mensagem
                createdAt: lastMessage.createdAt,
              }
            : null, // Última mensagem ou nul          contatoName: contato ? contato.name : null, // Nome do contato
          contatoPhone: contato ? contato.phone_number : null, // Número do contato
          contatoThumbnail: contato ? contato.thumbnail : null, // Thumbnail do contato
        };
      })
    );

    // 7. Retornar as conversas encontradas
    return conversasComDetalhes;
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    throw error; // Repassa o erro para ser tratado em outro lugar
  }
}

async function getConversaFull(id) {
  try {
    // 1. Buscar a conversa pelo ID
    const conversa = await Conversa.findOne({ where: { id } });

    // 2. Verificar se a conversa existe
    if (!conversa) {
      throw new Error("Conversa não encontrada");
    }

    // 3. Buscar todas as mensagens associadas à conversa
    const mensagens = await Message.findAll({
      where: { conversation_id: conversa.id },
      order: [["createdAt", "ASC"]], // Ordena as mensagens por data
    });

    // 4. Buscar o contato associado à conversa
    const contato = await Contato.findOne({
      where: { phone_number: conversa.contato_id },
    });

    // 5. Retornar os detalhes da conversa, incluindo todas as mensagens
    return {
      id: conversa.id,
      contato_id: conversa.contato_id,
      mensagens: mensagens.map((msg) => ({
        id: msg.id,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.createdAt,
        type: msg.type,
      })), // Array de mensagens
      contatoName: contato ? contato.name : "null", // Nome do contato
      contatoPhone: contato ? contato.phone_number : "null", // Número do contato
      contatoThumbnail: contato ? contato.thumbnail : null, // Thumbnail do contato
    };
  } catch (error) {
    console.error("Erro ao resgatar conversa:", error.message);
    throw error; // Repassa o erro para ser tratado em outro lugar
  }
}

async function savePhones(adminId, phone) {
  try {
    console.log("phone.string", phone.toString());
    // Verifica se o telefone é válido
    if (!phone) {
      throw new Error("Número de telefone é obrigatório.");
    }

    // Busca o administrador pelo ID
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }

    // Atualiza o número de telefone
    admin.phone = phone.toString();
    await admin.save();

    return { message: "Número de telefone salvo com sucesso!", admin };
  } catch (error) {
    console.error("Erro ao salvar telefone:", error.message);
    throw error;
  }
}

async function saveToken(waid, acesstoken, adminId) {
  try {
    if (!waid) {
      throw new Error("waid é obrigatório.");
    }

    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }
    const tk = acesstoken.toString();
    const idn = waid.toString();
    admin.acessToken = tk;
    admin.idNumero = idn;

    await admin.save();
    return { message: "Tokens Salvos!", admin };
  } catch (error) {
    console.error("Erro ao salvar tokens:", error.message);
    return { message: "Erro ao salvar tokens" };
  }
}

module.exports = {
  saveProfile,
  getContatos,
  getConversation,
  savePhones,
  getConversaFull,
  saveToken,
  getInfos,
  getEtiquetas,
};
