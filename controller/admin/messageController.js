const {
  findContactByPhoneNumber,
  findConversationByContactId,
  receivedMessage,
  botMsg,
  msgClient,
  postImg,
  postAudios,
  botMedia,
  botAudio,
  botDoc,
} = require("../../service/messageService");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Ajuste o destino conforme necessário
const ffmpeg = require("fluent-ffmpeg");
const { response } = require("express");

async function VaiCorinthians(req, res) {
  // WhatsApp envia o hub.challenge no parâmetro
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Seu token de verificação (configure isso no seu painel do WhatsApp)
  const verifyToken =
    "EAAMaEvMlYFYBOzM0Ga4ef907rL4NXA6IwM8z5uc7ZAs3lJZBfd2wrxk9j3F5ldTE7duE7eZCpRCyGiFWYTPsqz9W7az2gAyujlhyKrMd5ocyWAxWm6sIZAlv26YWHSmlbycmbZAg86tYvDjkZAPIUdteBBWhHmzL6jyeQCKhddcw9xJIqgp0SlmxnYwESponYZCy0nxKuPlCnczOKZAwPTBquV3hYE0ZD";

  // Verifica se o token e o modo estão corretos
  if (mode && token === verifyToken) {
    console.log("Webhook verificado com sucesso!");
    // Retorna o desafio como esperado pela API do WhatsApp
    res.status(200).send(challenge);
  } else {
    // Caso contrário, retorna erro 403 (não autorizado)
    res.status(403).send("Falha na verificação do webhook.");
  }
}

async function FindContact(phoneNumber) {
  try {
    const contact = await findContactByPhoneNumber(phoneNumber);
    res.json(contact);
  } catch (err) {
    console.error("Error fetching users", err.stack);
    res.status(500).send("Server error");
  }
}

async function FindConversation(contactId) {
  try {
    const contact = await findConversationByContactId(contactId);
    res.json(contact);
  } catch (err) {
    console.error("Error fetching users", err.stack);
    res.status(500).send("Server error");
  }
}

async function PostMsg(req, res) {
  const incomingData = req.body;

  try {
    let cleanedData;

    if (
      incomingData.object === "whatsapp_business_account" &&
      incomingData.entry
    ) {
      const entry = incomingData.entry[0];

      // Verifica se as mudanças contêm mensagens
      if (entry.changes && entry.changes.length) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            cleanedData = change.value; // Apenas dados de mensagens
            break; // Para evitar continuar se já encontramos mensagens
          }
        }
      } else {
        throw new Error(
          "Estrutura de dados inválida: 'changes' não encontrado"
        );
      }
    } else {
      console.log(
        "Estrutura de dados não é whatsapp_business_account, ignorando."
      );
      return res.status(400).send("Estrutura de dados inválida.");
    }

    // Verifica se cleanedData foi populado
    if (
      !cleanedData ||
      !cleanedData.messages ||
      cleanedData.messages.length === 0
    ) {
      console.log("Nenhuma mensagem válida encontrada, ignorando.");
      return res.status(200).send("Nenhuma mensagem para processar.");
    }

    // Log dos dados recebidos
    console.log("cleanedData", cleanedData);

    // Processar cada mensagem
    for (const message of cleanedData.messages) {
      // Verifica o tipo da mensagem e chama a função correspondente
      switch (message.type) {
        case "text":
          await receivedMessage(message.text.body); // Acessa o texto
          break;
        case "image":
          await postImg(message.image); // Acessa a imagem
          break;
        case "document":
          await postImg(message.document); // Acessa o documento
          break;
        case "audio":
          await postAudios(message.audio); // Acessa o áudio
          break;
        default:
          console.log(`Tipo de mensagem desconhecido: ${message.type}`);
      }
    }

    res.status(200).json({ message: "Mensagens processadas com sucesso!" });
  } catch (err) {
    console.error("Erro ao processar as mensagens:", err);
    res.status(500).send("Erro no servidor");
  }
}

async function UserSendMsg(req, res) {
  const { content, conversation_id, phonecontact, contactId } = req.body;
  const adminId = req.user.id;
  const conversationId = conversation_id;
  const idConversa = conversation_id;

  try {
    const msg = await msgClient(
      adminId,
      conversationId,
      phonecontact,
      idConversa,
      content,
      contactId
    );
    res.json({ msg });
  } catch (error) {
    console.error("Error send msg", error);
    res.status(500).send("Server error");
  }
}

async function PostBotMsg(req, res) {
  const incomingData = req.body;

  try {
    const msgResults = await botMsg(incomingData);
    //const msgResults = await Promise.all(msgPromises);

    res
      .status(200)
      .json({ message: "Mensagens processadas com sucesso!", msgResults });
  } catch (error) {
    console.log("erro ao pegar msg robo", error);
    res.status(500).send("Server error");
  }
}

async function PostBotImg(req, res) {
  const incomingData = req.body;
  // Verifica se incomingData é um array ou um único objeto
  const messages = Array.isArray(incomingData) ? incomingData : [incomingData];

  try {
    const msgImgPromises = messages.map((messageData) => postImg(messageData));
    const msgImgResults = await Promise.all(msgImgPromises);
    res.json(msgImgResults);
  } catch (error) {
    console.log("erro ao salvar img", error);
    res.status(500).send("Server error");
  }
}

async function PostAudio(req, res) {
  const incomingData = req.body;

  try {
    const msgAudio = await postAudios(incomingData);
    res.json(msgAudio);
  } catch (error) {
    console.log("erro ao pegar msg robo", error);
    res.status(500).send("Server error");
  }
}

async function PostDoc(req, res) {
  const { conversation_id, phonecontact, contactId } = req.body;
  const adminId = req.user.id;
  const conversationId = conversation_id;

  // O arquivo está disponível em req.file
  const filePath = req.file.path; // O caminho do arquivo salvo

  try {
    const msg = await botDoc(
      adminId,
      conversationId,
      phonecontact,
      conversation_id, // ou idConversa, se preferir
      filePath, // Passando o caminho do arquivo
      contactId
    );
    res.json({ msg });
  } catch (error) {
    console.log("Erro ao processar a mensagem:", error);
    res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

async function BotPostMedia(req, res) {
  const { conversation_id, phonecontact, contactId } = req.body;
  const adminId = req.user.id;
  const conversationId = conversation_id;

  // O arquivo está disponível em req.file
  const filePath = req.file.path; // O caminho do arquivo salvo
  const fileType = req.file.mimetype; // Pega o tipo MIME completo

  try {
    // Mapeando o tipo de arquivo para os tipos aceitos pela função botMedia
    const mappedFileType = mapFileType(fileType);

    const msg = await botMedia(
      adminId,
      conversationId,
      phonecontact,
      conversation_id, // ou idConversa, se preferir
      filePath, // Passando o caminho do arquivo
      contactId,
      mappedFileType // Passando o tipo mapeado
    );

    res.json({ msg });
  } catch (error) {
    console.log("Erro ao processar a mensagem:", error);
    res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

// Função para mapear o tipo de arquivo
// Função para mapear o tipo de arquivo
function mapFileType(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.startsWith("application/vnd"))
    return "document";
  if (mimeType === "text/plain") return "document"; // Adicionando suporte para arquivos de texto
  throw new Error(`Tipo de arquivo não suportado: ${mimeType}`);
}

async function BotPostAudio(req, res) {
  const { conversation_id, phonecontact, contactId } = req.body;
  const adminId = req.user.id;

  // O arquivo está disponível em req.file
  const filePath = req.file.path; // O caminho do arquivo salvo

  try {
    const msg = await botAudio(
      adminId,
      conversation_id,
      phonecontact,
      conversation_id, // ou idConversa, se preferir
      filePath, // Passando o caminho do arquivo
      contactId
    );
    res.json({ msg });
  } catch (error) {
    if (error.response) {
      // If the error comes from the API request
      console.error("Erro da API:", error.response.data);
      throw new Error(
        error.response.data.error.message || "Erro desconhecido da API"
      );
    } else if (error.request) {
      // If the request was made but no response was received
      console.error("Nenhuma resposta da API:", error.request);
      throw new Error("Nenhuma resposta da API.");
    } else {
      // If there was an error setting up the request
      console.error("Erro ao enviar a mídia:", error.message);
      throw new Error(error.message);
    }
    res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

module.exports = {
  FindContact,
  FindConversation,
  PostMsg,
  UserSendMsg,
  PostBotMsg,
  PostBotImg,
  PostAudio,
  PostDoc,
  BotPostMedia,
  BotPostAudio,
  VaiCorinthians,
};
