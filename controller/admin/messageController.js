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
  // quando o bot manda mensagem
  const incomingData = req.body; // Assume que o body contém um objeto com 'statuses'

  // Verifique se 'statuses' está presente e é um array
  const messages = incomingData.statuses || []; // Se 'statuses' não existir, inicializa como array vazio

  try {
    // Enviar os dados necessários para a função receivedMessage

    const msgResult = await receivedMessage(incomingData);

    res
      .status(200)
      .json({ message: "Mensagens processadas com sucesso!", msgResult });
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
  const fileType = req.file.mimetype.split("/")[0]; // Pega o tipo (audio, image, video, etc.)
  try {
    const msg = await botMedia(
      adminId,
      conversationId,
      phonecontact,
      conversation_id, // ou idConversa, se preferir
      filePath, // Passando o caminho do arquivo
      contactId,
      fileType
    );
    res.json({ msg });
  } catch (error) {
    console.log("Erro ao processar a mensagem:", error);
    res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
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
};
