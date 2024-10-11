const Admin = require("../models/Admin"); // Certifique-se de que o modelo Admin esteja importado corretamente
//const sequelize = require('../config/db'); // Caminho para o arquivo onde sequelize está configurado
const Message = require("../models/Message"); // Importe o modelo correto
const Conversa = require("../models/Conversation");
const Contato = require("../models/Contato");
const Etiquetas = require("../models/Etiquetas");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // TTL de 60 segundos
require("../models/relations"); // Ajuste o caminho conforme necessário

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
  const cacheKey = `conversas_${adminPhone}`;

  // Verificar se os dados estão no cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData; // Retornar dados do cache se disponíveis
  }

  try {
    // 1. Buscar o Admin pelo número de telefone
    const admin = await Admin.findOne({ where: { phone: adminPhone } });

    // 2. Verificar se o Admin existe
    if (!admin) {
      throw new Error("Admin não encontrado");
    }

    // 3. Buscar todos os Contatos associados ao Admin, incluindo Conversas e a última Mensagem
    const contatos = await Contato.findAll({
      where: { phoneadmin: adminPhone },
      include: [
        {
          model: Conversa,
          as: "conversas", // Use o alias definido nas associações
          include: [
            {
              model: Message,
              as: "messages", // Use o alias definido nas associações
              order: [["createdAt", "DESC"]],
              limit: 1, // Pegar apenas a última mensagem
            },
          ],
        },
      ],
    });

    // 4. Extrair as conversas e suas últimas mensagens
    const conversasComDetalhes = contatos.map((contato) => {
      const conversa = contato.conversas[0]; // Pegar a primeira conversa (última mensagem)
      const lastMessage = conversa.messages[0]; // A última mensagem da conversa

      return {
        id: conversa.id,
        contato_id: contato.phone_number,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
            }
          : null,
        contatoName: contato.name,
        contatoPhone: contato.phone_number,
        contatoThumbnail: contato.thumbnail,
      };
    });

    // 5. Armazenar os dados no cache
    cache.set(cacheKey, conversasComDetalhes);

    // 6. Retornar as conversas encontradas
    return conversasComDetalhes;
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    throw error; // Repassa o erro para ser tratado em outro lugar
  }
}

async function getConversaFull(id) {
  try {
    // 1. Buscar a conversa pelo ID
    const conversa = await Conversa.findOne({
      where: { id },
      include: [
        {
          model: Contato,
          as: "contato", // Usar o alias definido nas associações
        },
      ],
    });

    // 2. Verificar se a conversa existe
    if (!conversa) {
      throw new Error("Conversa não encontrada");
    }

    // 3. Buscar todas as mensagens associadas à conversa
    const mensagens = await Message.findAll({
      where: { conversation_id: conversa.id },
      order: [["createdAt", "ASC"]], // Ordena as mensagens por data
    });

    // 4. Retornar os detalhes da conversa, incluindo todas as mensagens e o contato
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
      contatoName: conversa.contato ? conversa.contato.name : null, // Nome do contato
      contatoPhone: conversa.contato ? conversa.contato.phone_number : null, // Número do contato
      contatoThumbnail: conversa.contato ? conversa.contato.thumbnail : null, // Thumbnail do contato
    };
  } catch (error) {
    console.error("Erro ao resgatar conversa:", error.message);
    throw error; // Repassa o erro para ser tratado em outro lugar
  }
}

async function savePhones(adminId, phone) {
  try {
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
