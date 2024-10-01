const {
  findContactByPhoneNumber,
  findConversationByContactId,
  receivedMessage,
  botMsg,
  msgClient,
  postImg,
  postAudios,
} = require("../../service/messageService");

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
  console.log("caiu no post PostMsg:");
  const incomingData = req.body; // Assume que o body contém um array de mensagens
  const messages = Array.isArray(incomingData) ? incomingData : [incomingData];
  console.log("incomingData", incomingData);

  try {
    // Enviar os dados necessários para a função receivedMessage
    const msgImgPromises = messages.map((messageData) =>
      receivedMessage(messageData)
    );
    const msgImgResults = await Promise.all(msgImgPromises);
    res
      .status(200)
      .json({ message: "Mensagens processadas com sucesso!", msgImgResults });
  } catch (err) {
    console.error("Error fetching users", err.stack);
    res.status(500).send("Server error");
  }
}

async function UserSendMsg(req, res) {
  const text = req.body;
  const adminId = req.user.id;

  try {
    const msg = await msgClient(
      adminId,
      conversationId,
      phonecontact,
      idConversa,
      content
    );
    res.json({ msg });
  } catch (error) {
    console.error("Error send msg", err.stack);
    res.status(500).send("Server error");
  }
}

async function PostBotMsg(req, res) {
  console.log("caiu no post PostBotMsg:");
  const incomingData = req.body;
  try {
    const msg = await botMsg(incomingData);
    res.json(msg);
  } catch (error) {
    console.log("erro ao pegar msg robo", error);
    res.status(500).send("Server error");
  }
}

async function PostBotImg(req, res) {
  console.log("caiu no post img:");
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
  console.log("caiu no post PostAudio:");
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
  const incomingData = req.body;

  try {
    const msgDoc = await postDoc(incomingData);
    res.json(msgDoc);
  } catch (error) {
    console.log("erro ao pegar msg robo", error);
    res.status(500).send("Server error");
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
};
