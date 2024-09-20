const express = require('express');
const profileController = require('../controller/admin/profileController');
const checkToken = require('../middlewares/checkToken')
const router = express.Router();

// Rota para registrar usuário
router.post('/receivedtext', profileController.sendmsg);

module.exports = router;