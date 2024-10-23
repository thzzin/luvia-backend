const Contato = require("../models/Contato");
const Conversa = require("../models/Conversation");
const Message = require("../models/Message");
const Admin = require("../models/Admin");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data"); // Certifique-se de que você importou isso
const ffmpeg = require("fluent-ffmpeg");

const { handleMessage } = require("./bot");

// Função para buscar um contato pelo número de telefone ou criar um novo
// Função para buscar ou criar um contato (usando o número como o ID do contato)
async function findOrCreateContact(phoneNumber, name, adminId) {
  try {
    const phoneAsString = phoneNumber.toString();
    const phoneAdmin = adminId.toString(); // Assegurando que é uma string

    // Usar findOrCreate para evitar o erro de chave única
    const [contact, created] = await Contato.findOrCreate({
      where: {
        phone_number: phoneAsString,
      },
      defaults: {
        name: name,
        phoneadmin: phoneAdmin,
      },
    });

    // contact será o contato encontrado ou criado
    // created será true se o contato foi criado, false se encontrado
    if (created) {
      console.log(`Novo contato criado: ${contact.id}`);
    } else {
      console.log(`Contato já existente: ${contact.id}`);
    }

    return contact.id; // Retorne o ID do contato encontrado ou criado
  } catch (error) {
    console.error("Erro ao buscar ou criar contato:", error);
    throw error; // Lança o erro para o chamador lidar
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

const vendedores = {
  dienifer: {
    formatted_name: "Dienifer",
    phone: "+553172026586",
  },
  angelo: {
    formatted_name: "Angelo",
    phone: "+553187622986",
  },
  eduardo: {
    formatted_name: "Eduardo",
    phone: "+553199917902",
  },
  fabricio: {
    formatted_name: "Fabricio",
    phone: "+553185525727",
  },
  taynara: {
    formatted_name: "Taynara",
    phone: "+553188535201",
  },
  titao: {
    formatted_name: "Titao",
    phone: "+553187155210",
  },
};

// Função para enviar o contato via API do WhatsApp
// Função para enviar o contato via API do WhatsApp
async function enviarContato(vendedorData, phoneNumber, adminId) {
  let admin = await Admin.findByPk(adminId);

  // Se não encontrar pelo ID, tenta encontrar pelo telefone
  if (!admin) {
    console.log(
      "Administrador não encontrado pelo ID. Tentando buscar pelo telefone..."
    );
    admin = await Admin.findOne({ where: { phone: adminId } }); // Aqui, adminId é o telefone
  }
  if (!admin) {
    throw new Error("Administrador não encontrado.");
  }
  const phoneadmin = admin.phone;
  const idNumero = admin.idNumero;
  const acessToken = admin.acessToken;

  // Ajuste no campo 'name' para incluir first_name e last_name
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "contacts",
    contacts: [
      {
        name: {
          formatted_name: vendedorData.formatted_name,
          first_name: vendedorData.formatted_name.split(" ")[0], // Pega o primeiro nome
          last_name: vendedorData.formatted_name.split(" ")[1] || "", // Pega o último nome (se houver)
        },
        phones: [
          {
            phone: vendedorData.phone,
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${idNumero}/messages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${acessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Contato enviado com sucesso:", response.data);
  } catch (error) {
    console.error(
      "Erro ao enviar o contato:",
      error.response ? error.response.data : error.message
    );
  }
}

function verificarIntencaoDeCompra(texto) {
  const palavrasChave = [
    "pedido",
    "fazer pedido",
    "comprar",
    "compra",
    "encomendar",
  ];
  return palavrasChave.some((palavra) => texto.includes(palavra));
}

// Função para enviar a lista de vendedores para o cliente
async function perguntarVendedor(
  phoneNumber,
  adminId,
  conversationId,
  idConversa
) {
  const mensagem =
    "Com qual vendedor você gostaria de falar? Temos os seguintes vendedores disponíveis:\n" +
    "1. Dienifer\n" +
    "2. Angelo\n" +
    "3. Eduardo\n" +
    "4. Fabricio\n" +
    "5. Taynara\n" +
    "6. Titao";

  await msgClient(
    adminId,
    conversationId,
    phoneNumber,
    idConversa,
    mensagem,
    null
  );
}

async function receivedMessage(incomingData) {
  try {
    const phoneNumber = incomingData.contacts[0].wa_id;
    const name = incomingData.contacts[0].profile.name;
    const content = incomingData.messages[0].text.body;

    const adminId = incomingData.metadata.display_phone_number; // Acesse diretamente a propriedade
    const idConversation = incomingData.messages[0].id;
    console.log("adminId", adminId);
    console.log("content", content);

    // Processa as funções findOrCreateContact e findOrCreateConversation
    console.log(
      "vai achar o contato ou criar passando",
      phoneNumber,
      name,
      adminId
    );
    const contactId = await findOrCreateContact(phoneNumber, name, adminId);
    console.log(
      "vai criar ou achar a conversa passando",
      contactId,
      adminId,
      idConversation
    );
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

    const phonecontact = phoneNumber.toString();
    if (adminId === "6283163270069" && phonecontact !== "5513991250485") {
      const idConversa = idConversation.toString();
      const phonecontact = phoneNumber.toString();
      const botLowerCase = content.toLowerCase();
      const intencaoDeCompra = verificarIntencaoDeCompra(botLowerCase);

      if (intencaoDeCompra) {
        // Pergunta ao cliente com qual vendedor ele quer falar
        await perguntarVendedor(
          phonecontact,
          adminId,
          conversationId,
          idConversa
        );
        return message; // Finaliza a função após perguntar o vendedor
      }

      let vendedorEncontrado = null;

      for (const vendedor in vendedores) {
        if (botLowerCase.includes(vendedor)) {
          vendedorEncontrado = vendedores[vendedor];
          break; // Enviar o contato do primeiro vendedor encontrado
        }
      }

      // Se um vendedor foi mencionado, envia o contato
      if (vendedorEncontrado) {
        //await enviarContato(vendedorEncontrado, phonecontact, adminId);
        const num = `${vendedorEncontrado.phone} - ${vendedorEncontrado.formatted_name}`;
        await msgClient(
          adminId,
          conversationId,
          phonecontact,
          idConversa,
          num,
          contactId
        );
        return message;
      }

      const bot = await handleMessage(content);

      console.log(bot);

      // Continuar com o envio da mensagem original
      msgClient(
        adminId,
        conversationId,
        phonecontact,
        idConversa,
        bot,
        contactId
      );
      return message;
    }

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
  console.log("recebeu", contactId);

  try {
    const conversation = await Conversa.findOne({
      where: { contato_id: contactId },
      include: [
        {
          model: Contato,
          as: "contato", // Alias correto, deve ser o mesmo que o utilizado na associação
        },
      ],
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
    let admin = await Admin.findByPk(adminId);

    // Se não encontrar pelo ID, tenta encontrar pelo telefone
    if (!admin) {
      console.log(
        "Administrador não encontrado pelo ID. Tentando buscar pelo telefone..."
      );
      admin = await Admin.findOne({ where: { phone: adminId } }); // Aqui, adminId é o telefone
    }
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

    //console.log("response:", response);

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
    console.log("phoneNumberAdmin", phoneNumberAdmin);
    const admin = await Admin.findOne({
      where: { phone: phoneNumberAdmin },
    });

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
      const url = "https://getluvia.com.br:3003/images/upload-from-whatsapp";
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
      console.log("url img", urlimg);
    } catch (error) {
      console.log("nao achou saporra", error);
    }

    console.log("");

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

    console.log("message imagem:", message);

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

    console.log("vai achar ou criar passando", phoneNumber, name, adminId);
    const contactId = await findOrCreateContact(phoneNumber, name, adminId);
    const conversation = await findOrCreateConversation(
      contactId,
      adminId,
      idConversation
    );

    const conversId = conversation.id;
    let urlimg;

    try {
      const url = "https://getluvia.com.br:3003/audio/upload-from-whatsapp";
      const response = await axios.post(url, {
        idAudio: idAudio, // Aqui você adiciona o idmessage
        bearerToken: bearerToken, // E o bearerToken
      });
      urlimg = response.data.imageUrl;
      console.log("response.data", response.data);
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

const mediaTypes = {
  audio: {
    types: {
      AAC: { extension: ".aac", mime: "audio/aac", maxSize: 16 * 1024 * 1024 },
      AMR: { extension: ".amr", mime: "audio/amr", maxSize: 16 * 1024 * 1024 },
      MP3: { extension: ".mp3", mime: "audio/mpeg", maxSize: 16 * 1024 * 1024 },
      MP4: { extension: ".m4a", mime: "audio/mp4", maxSize: 16 * 1024 * 1024 },
      OGG: { extension: ".ogg", mime: "audio/ogg", maxSize: 16 * 1024 * 1024 },
    },
  },
  document: {
    types: {
      Text: {
        extension: ".txt",
        mime: "text/plain",
        maxSize: 100 * 1024 * 1024,
      },
      ExcelX: {
        extension: ".xlsx",
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        maxSize: 100 * 1024 * 1024,
      },
      Excel: {
        extension: ".xls",
        mime: "application/vnd.ms-excel",
        maxSize: 100 * 1024 * 1024,
      },
      WordX: {
        extension: ".docx",
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        maxSize: 100 * 1024 * 1024,
      },
      Word: {
        extension: ".doc",
        mime: "application/msword",
        maxSize: 100 * 1024 * 1024,
      },
      PPTX: {
        extension: ".pptx",
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        maxSize: 100 * 1024 * 1024,
      },
      PPT: {
        extension: ".ppt",
        mime: "application/vnd.ms-powerpoint",
        maxSize: 100 * 1024 * 1024,
      },
      PDF: {
        extension: ".pdf",
        mime: "application/pdf",
        maxSize: 100 * 1024 * 1024,
      },
    },
  },
  image: {
    types: {
      JPEG: {
        extension: ".jpeg",
        mime: "image/jpeg",
        maxSize: 5 * 1024 * 1024,
      },
      PNG: { extension: ".png", mime: "image/png", maxSize: 5 * 1024 * 1024 },
      WebPAnimated: {
        extension: ".webp",
        mime: "image/webp",
        maxSize: 500 * 1024,
      }, // Animated sticker
      WebPStatic: {
        extension: ".webp",
        mime: "image/webp",
        maxSize: 100 * 1024,
      }, // Static sticker
    },
  },
  video: {
    types: {
      MP4: { extension: ".mp4", mime: "video/mp4", maxSize: 16 * 1024 * 1024 },
      ThreeGP: {
        extension: ".3gp",
        mime: "video/3gp",
        maxSize: 16 * 1024 * 1024,
      },
    },
  },
};

async function botMedia(
  adminId,
  conversationId,
  phonecontact,
  idConversa,
  filePath,
  contactId,
  fileType
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
    // Validando tipo de mídia
    const validTypeInfo = validateFileType(fileType, filePath);

    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error("Administrador não encontrado.");

    const { idNumero, acessToken } = admin;

    if (!acessToken) throw new Error("Token de acesso não encontrado.");
    if (!fs.existsSync(filePath))
      throw new Error("Arquivo não encontrado: " + filePath);
    if (fs.statSync(filePath).size > validTypeInfo.maxSize) {
      throw new Error(
        `Arquivo excede o tamanho máximo permitido de ${
          validTypeInfo.maxSize / (1024 * 1024)
        } MB.`
      );
    }

    // Fazendo o upload do arquivo
    const urlUpload = `https://graph.facebook.com/v21.0/${idNumero}/media`;
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append("file", fileStream, { filename: path.basename(filePath) });
    form.append("type", validTypeInfo.mime);
    form.append("messaging_product", "whatsapp");

    const uploadResponse = await axios.post(urlUpload, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${acessToken}`,
      },
    });

    const mediaId = uploadResponse.data.id;
    if (!mediaId) throw new Error("Media ID não foi retornado no upload.");

    // Enviando a mensagem com o ID do arquivo
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phonecontact,
      type: fileType,
      [fileType]: { id: mediaId },
    };

    await axios.post(
      `https://graph.facebook.com/v21.0/${idNumero}/messages`,
      messageData,
      {
        headers: { Authorization: `Bearer ${acessToken}` },
      }
    );

    // Registrando a mensagem no banco de dados
    const conversId = await findOrCreateConversation(
      contactId,
      adminId,
      conversationId
    );
    const conversationIdValue = conversId.id || conversId[0]?.id;

    let urlImage;
    try {
      const url = "https://getluvia.com.br:3003/images/upload-from-whatsapp"; // Ajuste a URL conforme necessário
      const response = await axios.post(
        url,
        {
          idImage: mediaId,
          bearerToken: acessToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_access_token: `${acessToken}`,
          },
        }
      );
      urlImage = response.data.imageUrl; // Obtendo o URL da imagem
    } catch (error) {
      console.log("Erro ao fazer upload da imagem:", error.message);
    }

    const message = await Message.create({
      conversation_id: conversationIdValue.toString(),
      contato_id: phonecontact.toString(),
      content: urlImage || "", // Use o URL da imagem, se disponível
      message_type: "sent",
      type: fileType,
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

// Função para validar o tipo de arquivo
function validateFileType(fileType, filePath) {
  const typeInfo = mediaTypes[fileType];
  if (!typeInfo) {
    throw new Error(`Tipo de arquivo inválido: ${fileType}`);
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  const validType = Object.values(typeInfo.types).find(
    (type) => type.extension === fileExtension
  );

  if (!validType) {
    throw new Error(
      `Extensão do arquivo inválida para o tipo ${fileType}: ${fileExtension}`
    );
  }

  return validType;
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

    const conversId = await findOrCreateConversation(
      contactId,
      adminId,
      conversationId
    );

    let urlAudio;

    try {
      const url = "https://getluvia.com.br:3003/audio/upload-from-whatsapp";
      const response = await axios.post(
        url,
        {
          idAudio: mediaId, // Aqui você adiciona o idmessage
          bearerToken: acessToken, // E o bearerToken
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_access_token: `${acessToken}`,
          },
        }
      );
      urlAudio = response.data.imageUrl;
    } catch (error) {
      console.log("Erro ao fazer upload do áudio:", error.data);
    }

    const conversationIdValue = conversId.id || conversId[0].id;

    const message = await Message.create({
      conversation_id: conversationIdValue.toString(),
      contato_id: phonecontact.toString(),
      content: urlAudio,
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
