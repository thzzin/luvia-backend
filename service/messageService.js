const Contato = require("../models/Contato");
const Conversa = require("../models/Conversation");
const Message = require("../models/Message");
const Admin = require("../models/Admin");
const axios = require("axios");
// Função para buscar um contato pelo número de telefone ou criar um novo
// Função para buscar ou criar um contato (usando o número como o ID do contato)
async function findOrCreateContact(phoneNumber, name, adminId) {
  try {
    const phoneAsString = phoneNumber.toString();
    const phoneAdmin = adminId.toString();

    let contact = await Contato.findOne({
      where: { phone_number: phoneAsString },
    });
    if (!contact) {
      contact = await Contato.create({
        phone_number: phoneAsString,
        name,
        email: null,
        phoneadmin: phoneAdmin,
      });
    }
    return contact.phone_number; // Retorna o phone_number
  } catch (error) {
    console.error("Erro ao buscar ou criar contato:", error);
    throw error;
  }
}

async function findOrCreateConversation(contactId, adminId, idConversation) {
  try {
    console.log(
      "na conversa: contactId, adminId, idConversation",
      contactId,
      adminId,
      idConversation
    );
    const phoneAdmin = adminId.toString();
    const idConversationS = idConversation.toString();
    let conversation = await Conversa.findOne({
      where: { contato_id: contactId },
    });
    if (!conversation) {
      conversation = await Conversa.create({
        contato_id: contactId,
        phoneadmin: phoneAdmin,
        idConversation: idConversationS,
      }); // Use o phone_number aqui
    }
    //console.log('criou conversa', conversation);
    return conversation;
  } catch (error) {
    console.error("Erro ao buscar ou criar conversa:", error);
    throw error;
  }
}

// Função para salvar a mensagem
async function saveMessage(
  conversationId,
  contactId,
  content,
  type,
  adminId,
  phoneNumber,
  idConversation
) {
  try {
    //console.log('recebeu: ', conversationId, contactId, content, type, adminId);

    // Mapeia o tipo de mensagem para os valores válidos
    const validMessageType = type === "text" ? "received" : type;
    const message = await Message.create({
      conversation_id: conversationId.toString(),
      contato_id: contactId.toString(),
      content,
      message_type: validMessageType, // Use o tipo de mensagem mapeado
      admin_id: adminId.toString(),
      phonecontact: phoneNumber.toString(),
      idConversa: idConversation.toString(),
    });

    return message;
  } catch (error) {
    throw error;
  }
}

async function receivedMessage(incomingData) {
  console.log("caiu no receivedMessage pq recebeu UMA mensagem");
  try {
    // Como o incomingData é um objeto, você não precisa iterar sobre ele
    console.log("incomingData", incomingData);
    const phoneNumber = incomingData.contacts[0].wa_id;
    const name = incomingData.contacts[0].profile.name;
    const messageType = incomingData.messages[0].type;
    const content = incomingData.messages[0].text.body;

    const adminId = incomingData.metadata.display_phone_number;
    const idConversation = incomingData.messages[0].id;

    // Processa as funções findOrCreateContact e findOrCreateConversation
    const contactId = await findOrCreateContact(phoneNumber, name, adminId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );

    // Salva a mensagem com base no conteúdo processado
    const message = await Message.create({
      conversation_id: conversation.toString(),
      phonecontact: phoneNumber.toString(),
      type: "text",
      content,
      message_type: "received", // Use o tipo de mensagem mapeado
      admin_id: adminId.toString(),
      idConversa: idConversation.toString(),
    });

    console.log("message", message);

    return savedMsg;
  } catch (error) {
    console.error("Erro ao processar as mensagens:", error);
    throw error;
  }
}

// Função para buscar um contato pelo número de telefone
async function findContactByPhoneNumber(phoneNumber) {
  try {
    const contact = await Contato.findOne({
      where: { phone_number: phoneNumber },
    });
    return contact;
  } catch (error) {
    console.error("Erro ao buscar contato:", error);
    throw error;
  }
}

// Função para buscar uma conversa por ID de contato
async function findConversationByContactId(contactId) {
  try {
    const conversation = await Conversa.findOne({
      where: { contato_id: contactId },
    });
    return conversation;
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);
    throw error;
  }
}

async function botMsg(incomingData) {
  console.log("caiu no botmsg pq o bot mandou msg");
  try {
    for (const messageData of incomingData) {
      const phoneNumber = messageData.chatId; // Use o wa_id como phone_number
      const content = messageData.text;
      const messageType = "sent";
      const adminId = messageData.display_phone_number;
      const idConversation = messageData.chatMessageId;
      const conversationIdInt = parseInt(idConversation);

      const name = phoneNumber.toString();
      const contactId = await findOrCreateContact(phoneNumber, name, adminId);
      const conversation = await findOrCreateConversation(
        contactId,
        adminId,
        idConversation
      );
      const conversId = conversation.id;

      const message = await Message.create({
        conversation_id: conversId.toString(),
        contato_id: phoneNumber.toString(),
        content,
        message_type: messageType, // Use o tipo de mensagem mapeado
        admin_id: adminId.toString(),
        phonecontact: phoneNumber.toString(),
        idConversa: idConversation.toString(),
      });

      return message;
    }
  } catch (error) {
    //console.error('Erro ao processar as mensagens:', error);
    throw error;
  }
}

async function msgClient(
  adminId,
  conversationId,
  phonecontact,
  idConversa,
  content
) {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }
    const phoneadmin = admin.phone;
    const idNumero = admin.idNumero;
    const acessToken = admin.acessToken;

    const message = await Message.create({
      conversation_id: conversationId,
      contato_id: contactId,
      content,
      type: "text",
      message_type: "sent", // Use o tipo de mensagem mapeado
      admin_id: phoneadmin,
      phonecontact: phonecontact,
      idConversa: idConversa,
    });
    return message;
  } catch (error) {}
}

async function postImg(messageData) {
  try {
    const phoneNumberUser = messageData?.contacts?.[0]?.wa_id; // de quem enviou
    const phoneNumberAdmin = messageData?.metadata?.display_phone_number; // de quem recebeu
    const messageType = "received";
    const adminId = messageData?.metadata?.phone_number_id; // id do admin phone
    const idConversation = messageData?.messages?.[0]?.id; // id da conversa
    const name = messageData?.contacts?.[0]?.profile?.name; // Verifica se profile e name existem
    const idImage = messageData?.messages?.[0]?.image?.id; // ID da imagem
    const bearerToken = messageData?.accesstoken; // Captura o bearer token

    const contactId = await findOrCreateContact(phoneNumberUser, name, adminId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );
    const conversId = conversation.id;
    let urlimg;
    console.log("messadata", messageData);
    try {
      const url = "http://getluvia.com.br:3003/images/upload-from-whatsapp";
      const response = await axios.post(
        url,
        {
          idImage: idImage, // Aqui você adiciona o idmessage
          bearerToken: bearerToken, // E o bearerToken
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_access_token: `${bearerToken}`,
          },
        }
      );
      urlimg = response.data.imageUrl;
    } catch (error) {
      console.log("deu pau", error);
    }

    const message = await Message.create({
      conversation_id: conversId.toString(),
      contato_id: phoneNumberUser.toString(),
      content: urlimg,
      type: "image",
      message_type: messageType,
      admin_id: adminId.toString(),
      phonecontact: phoneNumberUser.toString(),
      idConversa: idConversation.toString(),
    });

    return message;
  } catch (error) {
    console.log("error", error);
  }
}

async function postAudios(req, res) {
  try {
  } catch (error) {}
}

async function postDoc(req, res) {
  try {
  } catch (error) {}
}

module.exports = {
  receivedMessage,
  findContactByPhoneNumber,
  findConversationByContactId,
  botMsg,
  msgClient,
  postImg,
  postAudios,
  postDoc,
};
