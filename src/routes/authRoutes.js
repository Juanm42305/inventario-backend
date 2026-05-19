const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

/** =========================================================================
 * RUTAS DE AUTENTICACIÓN
 * ========================================================================= */

// 📝 Ruta para registrar un nuevo usuario (Cliente o Administrador)
router.post('/register', AuthController.register);

// 🔑 Ruta para iniciar sesión y obtener el token JWT de acceso
router.post('/login', AuthController.login);

module.exports = router;