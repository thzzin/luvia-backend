const express = require('express');
const userController = require('../controller/admin/authController');
const profileController = require('../controller/admin/profileController')
const messageController = require('../controller/admin/messageController')
const {receivedMessage} = require('../controller/admin/messageController')
const router = express.Router();
const adminController = require('../controller/admin/adminController')
const checkToken = require('../middlewares/checkToken')

router.post('/addapi', profileController.apiMensagem)
// Rota para buscar todos os usuários
router.get('/', userController.getUsers);

// Rota para buscar flows do ManyChat
router.get('/info', checkToken, profileController.getProfile);

router.get('/contato', checkToken, adminController.getContats)
router.get('/conversation', checkToken, adminController.getConversations)
router.get('/conversa/:id', checkToken, adminController.getConversa)

router.post('/addmsg', checkToken, messageController.UserSendMsg)

router.post('/numero', checkToken, adminController.savePhone);
router.post('/tokens', checkToken, adminController.saveTokens)


router.post('/receivedmsg', messageController.PostMsg)
router.post('/botmsg', messageController.PostBotMsg)

router.get('/findcontact', messageController.FindContact)
router.get('/findconversation', messageController.FindConversation)

module.exports = router;