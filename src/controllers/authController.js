const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const AuthController = {
  /**
   * 📝 REGISTRO DE USUARIOS
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // 1. Soporte estático definitivo: acepta tanto 'name' (inglés) como 'nombre' (español)
      const email = req.body.email;
      const password = req.body.password;
      const role = req.body.role;
      const name = req.body.name || req.body.nombre; 

      // 2. Validaciones de seguridad básicas (Campos vacíos)
      if (!name || !email || !password) {
        return res.status(400).json({ 
          message: 'Todos los campos (nombre/name, email, password) son obligatorios.' 
        });
      }

      // 3. Validación de formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
      }

      // 4. Validación de longitud de contraseña (Seguridad de formularios)
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      }

      // 5. Verificar si el usuario ya existe en PostgreSQL
      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado.' });
      }

      // 6. ENCRIPTRACIÓN: Aplicamos hash a la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 7. Asignación de Roles: por defecto es 'client' si no es 'admin'
      const assignedRole = (role === 'admin') ? 'admin' : 'client';

      // 8. Guardar en la base de datos utilizando el modelo
      const newUser = await UserModel.create({
        name,
        email,
        passwordHash,
        role: assignedRole
      });

      // 9. Respuesta exitosa (Ocultando el hash de la contraseña por seguridad)
      res.status(201).json({
        message: 'Usuario registrado exitosamente.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });

    } catch (error) {
      next(error); // Delega el fallo al middleware de errores global en server.js
    }
  },

  /**
   * 🔑 INICIO DE SESIÓN (LOGIN)
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Validar que vengan los datos completos
      if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingresa tu correo y contraseña.' });
      }

      // 2. Buscar al usuario en la base de datos por su email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Mensaje genérico por seguridad
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // 3. COMPARACIÓN: Verificar si la contraseña coincide con el hash guardado
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // 4. GENERAR SESIÓN (JWT): Creamos el token firmado con la clave secreta
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' } // El token vencerá automáticamente en 8 horas
      );

      // 5. Enviar respuesta al cliente con sus datos de perfil y su token de acceso
      res.status(200).json({
        message: 'Autenticación exitosa. ¡Bienvenido!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;