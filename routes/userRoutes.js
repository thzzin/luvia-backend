const express = require("express");
const userController = require("../controller/admin/authController");
const profileController = require("../controller/admin/profileController");
const messageController = require("../controller/admin/messageController");
const { receivedMessage } = require("../controller/admin/messageController");
const router = express.Router();
const adminController = require("../controller/admin/adminController");
const contactController = require("../controller/admin/contactController");
const tagsController = require("../controller/admin/tagsController");
const checkToken = require("../middlewares/checkToken");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nome único com timestamp
  },
});

const upload = multer({ storage: storage });

router.post("/addapi", profileController.apiMensagem);
// Rota para buscar todos os usuários
router.get("/", userController.getUsers);

router.get("/info", checkToken, profileController.getProfile);

//-------------contatos-------------------
router.get("/contato", checkToken, adminController.getContats);
router.post("/contato", checkToken, contactController.addContatos);
router.delete("/contato", checkToken, contactController.delContatcs);
router.put("/contato", checkToken, contactController.editContatos);

//-------------contatos--------------------

router.get("/conversation", checkToken, adminController.getConversations);
router.get("/conversa/:id", checkToken, adminController.getConversa);
//---------------etiqueta-------------------
router.get("/etiqueta", checkToken, tagsController.getEtiqueta);
router.post("/etiqueta", checkToken, tagsController.postEtiquetas);
router.delete("/deleteetiqueta", checkToken, tagsController.delEtiquetas);
router.post("/editetiqueta", checkToken, tagsController.editEtiquetas);

router.post("/editchatetiqueta", checkToken, tagsController.addTagChat);
//---------------etiqueta-------------------
router.post("/addmsg", checkToken, messageController.UserSendMsg);
router.post(
  "/postmedia",
  checkToken,
  upload.single("file"),
  messageController.BotPostMedia
);

router.post(
  "/postdoc",
  checkToken,
  upload.single("file"),
  messageController.PostDoc
);

router.post("/numero", checkToken, adminController.savePhone);
router.post("/tokens", checkToken, adminController.saveTokens);

//---------------api-------------------
router.post("/receivedmsg", messageController.PostMsg);
router.get("/receivedmsg", messageController.VaiCorinthians);
router.post("/botmsg", messageController.PostBotMsg);
router.post("/postimg", messageController.PostBotImg);
router.post("/postaudio", messageController.PostAudio);

router.post(
  "/addaudio",
  checkToken,
  upload.single("file"),
  messageController.BotPostAudio
);
//---------------api-------------------

//---------------conversa contato--------------
router.get("/findcontact", messageController.FindContact);
router.get("/findconversation", messageController.FindConversation);
//---------------conversa contato--------------

module.exports = router;
