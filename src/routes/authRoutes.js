const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Ruta para registrar un nuevo usuario (Cliente o Admin)
router.post('/register', AuthController.register);

// Ruta para iniciar sesión y obtener el token JWT
router.post('/login', AuthController.login);

module.exports = router;