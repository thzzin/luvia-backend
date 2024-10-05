const Contato = require("../models/Contato");
const Admin = require("../models/Admin");

async function addContato(nome, phone, adminPhone) {
  try {
    //console.log("vai add contato com", nome, phone, adminPhone);
    const newContato = await Contato.create({
      phone_number: phone,
      name: nome,
      phoneadmin: adminPhone,
    });
    //console.log("contato add", newContato);
    return newContato;
  } catch (error) {
    console.log("erro ao adicionar contato", error);
  }
}

async function delContatos(id, phoneadmin) {
  try {
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
      //console.log("Contato excluído com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao excluir contato:", error);
  }
}

async function editContato(nome, phone, adminPhone) {
  try {
    const [updated] = await Contato.update(
      { name: nome, phone_number: phone },
      {
        where: {
          phone_number: phone, // Identifica o contato pelo número de telefone
          phoneadmin: adminPhone, // Verifica o telefone do admin
        },
      }
    );

    console.log("atualizado:", updated);

    if (updated) {
      // Para obter o contato atualizado, você pode usar o mesmo número de telefone
      const updatedContato = await Contato.findOne({
        where: {
          phone_number: phone,
          phoneadmin: adminPhone, // Certifique-se de buscar pelo telefone do admin também
        },
      });
      return updatedContato; // Retorna o contato atualizado
    } else {
      console.log(
        "Nenhum contato encontrado para atualizar com os dados fornecidos."
      );
      return null;
    }
  } catch (error) {
    console.error("Erro ao editar contato:", error);
    throw error; // Lança o erro para ser tratado na camada superior
  }
}

module.exports = {
  addContato,
  delContatos,
  editContato,
};
