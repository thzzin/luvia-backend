const {
  addContato,
  delContatos,
  editContato,
} = require("../../service/contatoService");

async function addContatos(req, res) {
  const { nome, phone } = req.body;
  const adminPhone = req.user.phone;
  //console.log("recebido:", nome, phone);
  try {
    const contato = await addContato(nome, phone, adminPhone);
    res.json(contato);
  } catch (error) {
    console.log("deu ruim e add contato", error);
    res.status(500).send("Server error");
  }
}

async function delContatcs(req, res) {
  const { id } = req.body;
  const adminPhone = req.user.phone;
  //console.log("recebido:", id, adminPhone);

  try {
    const delcontato = await delContatos(id, adminPhone);
    res.json(delcontato);
  } catch (error) {
    console.log("deu ruim del contato", error);
  }
}

async function editContatos(req, res) {
  const { oldPhone, nome, phone } = req.body; // Recebe o número antigo
  const adminPhone = req.user.phone;

  try {
    const editedcontato = await editContato(nome, phone, oldPhone, adminPhone);
    res.json(editedcontato);
  } catch (error) {
    console.log("erro ao editar", error);
    res.status(500).json({ error: "Erro ao editar contato" });
  }
}

module.exports = {
  addContatos,
  delContatcs,
  editContatos,
};
