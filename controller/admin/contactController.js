const { addContato, delContatos } = require("../../service/contatoService");

async function addContatos(req, res) {
  const { nome, phone } = req.body;
  const adminPhone = req.user.phone;
  console.log("recebido:", nome, phone);
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
  console.log("recebido:", id, adminPhone);

  try {
    const delcontato = await delContatos(id, adminPhone);
    res.json(delcontato);
  } catch (error) {
    console.log("deu ruim del contato", error);
  }
}

module.exports = {
  addContatos,
  delContatcs,
};
