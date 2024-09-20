const express = require('express');
const userController = require('../controller/admin/authController');
const checkToken = require('../middlewares/checkToken')
const router = express.Router();

// Rota para registrar usuário
router.post('/register', userController.register);

// Rota para login de usuário
router.post('/login', userController.login);

router.post('/verify', userController.verify)

router.post('/logout', checkToken, userController.logout)

module.exports = router;