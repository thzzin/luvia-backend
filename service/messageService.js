const Contato = require("../models/Contato");
const Conversa = require("../models/Conversation");
const Message = require("../models/Message");
const Admin = require("../models/Admin");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data"); // Certifique-se de que você importou isso
const ffmpeg = require("fluent-ffmpeg");

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
      console.log("vai criar contato");
      contact = await Contato.create({
        phone_number: phoneAsString,
        name,
        email: null,
        phoneadmin: phoneAdmin,
      });
      console.log("contact", contact);
    }
    return contact.phone_number; // Retorna o phone_number
  } catch (error) {
    console.error("Erro ao buscar ou criar contato:", error);
    throw error;
  }
}

async function findOrCreateConversation(contactId, adminId, idConversation) {
  try {
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
  try {
    console.log("incomingData", incomingData);
    const phoneNumber = incomingData.contacts[0].wa_id;
    const name = incomingData.contacts[0].profile.name;
    const content = incomingData.messages[0].text.body;

    const adminId = incomingData.metadata.display_phone_number; // Acesse diretamente a propriedade
    const idConversation = incomingData.messages[0].id;
    console.log("adminId", adminId);
    // Processa as funções findOrCreateContact e findOrCreateConversation
    const contactId = await findOrCreateContact(phoneNumber, name, adminId);
    console.log("contato:", contactId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );

    // Certifica-se de pegar o `id` da instância `conversation`
    const conversationId = conversation.id;

    // Salva a mensagem com base no conteúdo processado
    const message = await Message.create({
      conversation_id: conversationId.toString(), // Extrai o id da conversa
      phonecontact: phoneNumber.toString(),
      type: "text",
      content,
      message_type: "received", // Use o tipo de mensagem mapeado
      admin_id: adminId.toString(),
      idConversa: idConversation.toString(),
    });

    console.log("message", message);

    return message;
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
  content,
  contactId
) {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }
    const phoneadmin = admin.phone;
    const idNumero = admin.idNumero;
    const acessToken = admin.acessToken;

    const url = `https://graph.facebook.com/v21.0/${idNumero}/messages`;

    // Montar o corpo da requisição
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phonecontact, // O número do usuário que receberá a mensagem
      type: "text",
      text: {
        preview_url: false, // Define se links terão preview (true/false)
        body: content, // O corpo da mensagem de texto
      },
    };

    // Fazer a requisição POST para a API
    const response = await axios.post(url, messageData, {
      headers: {
        Authorization: `Bearer ${acessToken}`, // Bearer token para autenticação
        "Content-Type": "application/json",
      },
    });

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

    console.log("message", message);
    return message;
  } catch (error) {
    console.log("deu pau", error);
  }
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

    const admin = await Admin.findOne({ where: { phone: phoneNumberAdmin } });

    if (!admin) {
      throw new Error("Admin não encontrado com este número de telefone.");
    }

    const bearerToken = admin.acessToken;

    const contactId = await findOrCreateContact(phoneNumberUser, name, adminId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );
    const conversId = conversation.id;
    let urlimg;

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

async function postAudios(messageData) {
  try {
    const messages = messageData?.messages || [];
    const contacts = messageData?.contacts || [];

    if (messages.length === 0) {
      throw new Error("Nenhuma mensagem encontrada.");
    }

    const phoneNumber = messages[0]?.from; // de quem enviou
    const phoneNumberAdmin = messageData?.metadata?.display_phone_number; // de quem recebeu
    const messageType = "received";
    const adminId = messageData?.metadata?.phone_number_id; // id do admin phone
    const idConversation = messages[0]?.id; // id da conversa
    const name = contacts[0]?.profile?.name; // Verifica se profile e name existem
    const idAudio = messages[0]?.audio?.id; // ID do áudio

    if (!phoneNumber) {
      throw new Error("Número de telefone não definido.");
    }

    const admin = await Admin.findOne({ where: { phone: phoneNumberAdmin } });

    if (!admin) {
      throw new Error("Admin não encontrado com este número de telefone.");
    }

    const bearerToken = admin.acessToken;

    const contactId = await findOrCreateContact(phoneNumber, name, adminId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );

    const conversId = conversation.id;
    let urlimg;

    try {
      const url = "http://getluvia.com.br:3003/audio/upload-from-whatsapp";
      const response = await axios.post(
        url,
        {
          idAudio: idAudio, // Aqui você adiciona o idmessage
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
      console.log("Erro ao fazer upload do áudio:", error);
    }

    const message = await Message.create({
      conversation_id: conversId.toString(),
      contato_id: phoneNumber.toString(),
      content: urlimg,
      type: "audio",
      message_type: messageType,
      admin_id: adminId.toString(),
      phonecontact: phoneNumber.toString(),
      idConversa: idConversation.toString(),
    });

    return message;
  } catch (error) {
    console.log("Erro:", error.message);
  }
}

async function postDoc(req, res) {
  try {
  } catch (error) {}
}

async function botMedia(
  adminId,
  conversationId,
  phonecontact,
  idConversa,
  filePath,
  contactId
) {
  console.log("Entrou na função botMedia com os parâmetros:", {
    adminId,
    conversationId,
    phonecontact,
    idConversa,
    filePath,
    contactId,
  });

  try {
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      console.error(`Administrador não encontrado para o adminId: ${adminId}`);
      throw new Error("Administrador não encontrado.");
    }

    const { idNumero, acessToken } = admin;

    // Verifica se o token de acesso está presente
    if (!acessToken) {
      console.error("Token de acesso não encontrado.");
      throw new Error("Token de acesso não encontrado.");
    }

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado no caminho: ${filePath}`);
      throw new Error("Arquivo não encontrado: " + filePath);
    }

    // Fazendo o upload do arquivo
    const urlUpload = `https://graph.facebook.com/v21.0/${idNumero}/media`;

    // Obter informações do arquivo
    const fileStats = fs.statSync(filePath);
    const fileName = filePath.split("/").pop();
    const fileType = getFileType(fileName); // Certifique-se de que essa função está definida

    // Fazer o upload do arquivo
    const uploadResponse = await axios.post(urlUpload, null, {
      params: {
        file_name: fileName,
        file_length: fileStats.size,
        file_type: fileType,
      },
      headers: {
        Authorization: `Bearer ${acessToken}`,
      },
    });

    console.log("uploadResponse:", uploadResponse.data);

    const mediaId = uploadResponse.data.id;

    // Enviando a mensagem com o ID do arquivo
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phonecontact,
      type: "image",
      image: {
        id: mediaId,
      },
    };

    // Registrando a mensagem no banco de dados
    const conversId = await findOrCreateConversation(
      contactId,
      adminId,
      conversationId
    );

    const message = await Message.create({
      conversation_id: conversId.toString(),
      contato_id: phonecontact.toString(),
      content: fileName,
      message_type: "image",
      admin_id: adminId.toString(),
      phonecontact: phonecontact.toString(),
      idConversa: idConversa.toString(),
    });

    console.log("Mensagem registrada no banco de dados:", message);
    return message;
  } catch (error) {
    console.error("Erro ao enviar a mídia:", error.message);
    throw error; // Re-throw the error if you want to handle it further up
  }
}
async function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}
async function botAudio(
  adminId,
  conversationId,
  phonecontact,
  idConversa,
  filePath,
  contactId
) {
  try {
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }

    const { idNumero, acessToken } = admin;

    // Verifica se o token de acesso está presente
    if (!acessToken) {
      throw new Error("Token de acesso não encontrado.");
    }

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error("Arquivo não encontrado: " + filePath);
    }

    // Convertendo o arquivo para mp3
    const outputFilePath = path.join(__dirname, "converted.mp3");
    await convertToMp3(filePath, outputFilePath);

    // Fazendo o upload do arquivo
    const urlUpload = `https://graph.facebook.com/v21.0/${idNumero}/media`;

    const fileStream = fs.createReadStream(outputFilePath);

    const form = new FormData();
    form.append("file", fileStream, { filename: "converted.mp3" });
    form.append("type", "audio/mpeg");
    form.append("messaging_product", "whatsapp");

    const uploadResponse = await axios.post(urlUpload, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${acessToken}`,
      },
    });

    const mediaId = uploadResponse.data.id;
    if (!mediaId) {
      throw new Error("Media ID não foi retornado no upload.");
    }

    // Enviando a mensagem com o ID do arquivo
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phonecontact,
      type: "audio",
      audio: {
        id: mediaId,
      },
    };

    await axios.post(
      `https://graph.facebook.com/v21.0/${idNumero}/messages`,
      messageData,
      {
        headers: {
          Authorization: `Bearer ${acessToken}`,
        },
      }
    );

    // Registrando a mensagem no banco de dados
    console.log(
      "contactid, adminid, conversationid",
      contactId,
      admin,
      conversationId
    );
    const conversId = await findOrCreateConversation(
      contactId,
      adminId,
      conversationId
    );

    const conversationIdValue = conversId.id || conversId[0].id;

    const message = await Message.create({
      conversation_id: conversationIdValue.toString(),
      contato_id: phonecontact.toString(),
      content: "converted.mp3",
      message_type: "sent",
      type: "audio",
      admin_id: adminId.toString(),
      phonecontact: phonecontact.toString(),
      idConversa: idConversa.toString(),
    });

    return message;
  } catch (error) {
    console.error("Erro ao enviar a mídia:", error.message);
    throw error;
  }
}

function getFileType(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    default:
      throw new Error("Tipo de arquivo não suportado: " + ext);
  }
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
  botMedia,
  botAudio,
};
