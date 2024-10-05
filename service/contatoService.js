const Contato = require("../models/Contato");
const Admin = require("../models/Admin");

async function addContato(nome, phone, adminPhone) {
  try {
    console.log("vai add contato com", nome, phone, adminPhone);
    const newContato = await Contato.create({
      phone_number: phone,
      name: nome,
      phoneadmin: adminPhone,
    });
    console.log("contato add", newContato);
    return newContato;
  } catch (error) {
    console.log("erro ao adicionar contato", error);
  }
}

async function delContatos(id, phoneadmin) {
  try {
    console.log("vai del contato com", id, phoneadmin);

    const deleteContato = await Contato.destroy({
      where: {
        phone_number: id,
        phoneadmin: phoneadmin, // Adiciona a condição para o phoneadmin
      },
    });

    // Você pode verificar se algum contato foi excluído
    if (deleteContato === 0) {
      console.log(
        "Nenhum contato encontrado para excluir com os dados fornecidos."
      );
    } else {
      console.log("Contato excluído com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao excluir contato:", error);
  }
}

module.exports = {
  addContato,
  delContatos,
};
