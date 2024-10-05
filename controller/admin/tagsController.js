const {
  getEtiquetasByAdminId,
  postEtiqueta,
  editEtiqueta,
  deleteEtiqueta,
  addTagChats,
} = require("../../service/etiquetaService");

async function getEtiqueta(req, res) {
  const adminId = req.user.id;
  try {
    const etiquetas = await getEtiquetasByAdminId(adminId);
    res.json(etiquetas);
  } catch (error) {
    console.log("erro ao buscar etiquetas", error);
  }
}

async function postEtiquetas(req, res) {
  const adminId = req.user.id;
  const { name, color } = req.body;
  try {
    const etiqueta = await postEtiqueta(adminId, name, color);
    res.json(etiqueta);
  } catch (error) {
    console.log("erro ao subir etiquetas", error);
  }
}

async function editEtiquetas(req, res) {
  const adminId = req.user.id;
  const { etiquetaid } = req.body;
  try {
    const etiqueta = await editEtiqueta(adminId, etiquetaid);
    res.json(etiqueta);
  } catch (error) {
    console.log("erro ao subir etiquetas", error);
  }
}

async function delEtiquetas(req, res) {
  const adminId = req.user.id;
  const { etiquetaid } = req.body;
  try {
    const etiqueta = await deleteEtiqueta(adminId, etiquetaid);
    res.json(etiqueta);
  } catch (error) {
    console.log("erro ao subir etiquetas", error);
  }
}

async function addTagChat(req, res) {
  const adminId = req.user.id;
  const { conversaId, etiquetaid } = req.body; // Certifique-se de que `etiquetaid` está sendo passado corretamente

  try {
    const addtag = await addTagChats(conversaId, etiquetaid); // Passa `conversaId` e `etiquetaid`
    res.json(addtag);
  } catch (error) {
    console.log("Erro ao adicionar etiquetas", error);
    res.status(500).json({ message: "Erro ao adicionar etiqueta" });
  }
}

module.exports = {
  getEtiqueta,
  postEtiquetas,
  editEtiquetas,
  delEtiquetas,
  addTagChat,
};
