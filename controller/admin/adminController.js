const {
  getConversation,
  getContatos,
  savePhones,
  getConversaFull,
  saveToken,
} = require("../../service/profileService");

const checkToken = require("../../middlewares/checkToken");

async function savePhone(req, res) {
  let { phone } = req.body; // Captura o valor de `phone` do corpo da requisição
  if (typeof phone === "object") {
    phone = phone.number || phone.phone || Object.values(phone)[0]; // Ajuste conforme o formato do objeto
  }

  try {
    const adminId = req.user.id; // adminId já está disponível no req.user após checkToken ser executado

    const save = await savePhones(adminId, phone);
    res.json(save);
  } catch (error) {
    console.error("Error fetching users", error);
  }
}

async function saveTokens(req, res) {
  let { waid, acesstoken } = req.body;
  let { phone } = req.body;

  if (typeof phone === "object") {
    phone = phone.number || phone.phone || Object.values(phone)[0];
  }

  const adminId = req.user.id;
  try {
    const savedTokens = await saveToken(waid, acesstoken, adminId); // Chame a função correta
    const savedPhone = await savePhones(adminId, phone);

    // Responda com um objeto
    res.json({ savedTokens, savedPhone });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ message: "Erro ao salvar tokens ou telefone" });
  }
}

async function getContats(req, res) {
  const adminId = req.user.id;
  const phoneNumber = req.user.phone;

  try {
    const contatos = await getContatos(phoneNumber);
    //await saveProfile(profile); // Chama o serviço para salvar as informações no banco
    res.json(contatos);
  } catch (err) {
    console.error("Error fetching users", err.stack);
    res.status(500).send("Server error");
  }
}

async function getConversations(req, res) {
  const adminId = req.user.id;
  const adminPhone = req.user.phone;

  try {
    const conversas = await getConversation(adminPhone);

    res.json(conversas);
  } catch (error) {
    console.error("Error fetching users", error.stack);
    res.status(500).send("Server error");
  }
}

async function getConversa(req, res) {
  const id = req.params.id;
  const adminPhone = req.user.phone;

  try {
    const conversa = await getConversaFull(id);
    res.json(conversa);
  } catch (error) {
    res.status(500).send("Server error");
  }
}

module.exports = {
  getContats,
  savePhone,
  getConversations,
  getConversa,
  saveTokens,
};
