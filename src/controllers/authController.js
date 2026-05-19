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
      const { name, email, password, role } = req.body;

      // 1. Validaciones de seguridad básicas (Campos vacíos)
      if (!name || !email || !password) {
        return res.status(400).json({ 
          message: 'Todos los campos (nombre, email, password) son obligatorios.' 
        });
      }

      // 2. Validación de formato de correo electrónico básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
      }

      // 3. Validación de longitud de contraseña (Seguridad de formularios)
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      }

      // 4. Verificar si el usuario ya existe en PostgreSQL
      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado.' });
      }

      // 5. ENCRIPTRACIÓN: Aplicamos hash a la contraseña (Seguridad exigida)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 6. Guardar en la base de datos utilizando el modelo
      // Si no se envía un rol o se intenta enviar algo raro, por defecto es 'client'
      const assignedRole = (role === 'admin') ? 'admin' : 'client';

      const newUser = await UserModel.create({
        name,
        email,
        passwordHash,
        role: assignedRole
      });

      // 7. Respuesta exitosa (Ocultando el hash de la contraseña por seguridad)
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
      next(error); // Delega el fallo al middleware de errores global
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
        // Mensaje genérico por seguridad (así los atacantes no saben si falló el correo o la clave)
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // 3. COMPARACIÓN: Verificar si la contraseña coincide con el hash guardado
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // 4. GENERAR SESIÓN (JWT): Creamos el token firmado con la clave secreta
      // Guardamos el ID y el ROL dentro del token para que los middlewares puedan proteger las rutas
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