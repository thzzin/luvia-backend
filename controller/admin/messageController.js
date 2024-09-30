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
  const incomingData = req.body; // Assume que o body contém um array de mensagens

  try {
    // Enviar os dados necessários para a função receivedMessage
    await receivedMessage(incomingData);
    res.status(200).json({ message: "Mensagens processadas com sucesso!" });
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
  const incomingData = req.body;
  console.log("recebeu:", incomingData);
  try {
    const msg = await botMsg(incomingData);
    res.json(msg);
  } catch (error) {
    console.log("erro ao pegar msg robo", error);
    res.status(500).send("Server error");
  }
}

async function PostBotImg(req, res) {
  //const incomingData = req.body;
  console.log(
    "Caiu no post img, corpo da requisição:",
    JSON.stringify(req.body, null, 2)
  );
  try {
    //const msgImg = await postImg(incomingData);
    //res.json(msgImg);
  } catch (error) {
    console.log("erro ao salvar img", error);
    res.status(500).send("Server error");
  }
}

async function PostAudio(req, res) {
  const incomingData = req.body;
  console.log("recebeu:", incomingData);

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
  console.log("recebeu:", incomingData);

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
