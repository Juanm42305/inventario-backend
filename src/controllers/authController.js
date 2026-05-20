const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Almacenamiento temporal en memoria para los códigos OTP de verificación
// En producción idealmente usarías Redis, pero esto es perfecto para tu desarrollo actual
const otpCache = new Map();

const AuthController = {
  /**
   * 📝 REGISTRO DE USUARIOS (CERRADO POR SEGURIDAD)
   * POST /api/auth/register
   */
  async register(req, res) {
    // Candado estático: Bloqueo de registros públicos masivos.
    return res.status(403).json({ 
      message: 'El registro público está deshabilitado. Solicita tus credenciales al administrador del sistema.' 
    });
  },

  /**
   * 🔑 INICIO DE SESIÓN (LOGIN - PASO 1: VALIDACIÓN Y GENERACIÓN DE CÓDIGO)
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingresa tu correo y contraseña.' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // GENERACIÓN DEL CÓDIGO DE SEGUNDO FACTOR (Mínimo de seguridad exigido)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
      const expiresAt = Date.now() + 5 * 60 * 1000; // Expira en 5 minutos

      // Guardamos el código temporal asociado al correo del usuario
      otpCache.set(email, { otpCode, expiresAt, userId: user.id, userRole: user.role });

      // LOG DIAGNÓSTICO: Como no tenemos servidor SMTP real de correo conectado, 
      // verás el código impreso en la terminal/logs de Render para poder usarlo en las pruebas.
      console.log(`📩 [VERIFICACIÓN] Código enviado para ${email}: ${otpCode}`);

      return res.status(200).json({
        requiresVerification: true,
        email,
        message: 'Credenciales válidas. Se ha generado un código de verificación de 6 dígitos.'
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * 📲 VERIFICACIÓN DEL SEGUNDO FACTOR (PASO 2: CONFIRMACIÓN DE OTP Y EMISIÓN DE JWT)
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: 'El correo y el código OTP son obligatorios.' });
      }

      const cachedData = otpCache.get(email);

      if (!cachedData) {
        return res.status(400).json({ message: 'No hay ninguna solicitud de login activa para este correo.' });
      }

      // Validar expiración del código
      if (Date.now() > cachedData.expiresAt) {
        otpCache.delete(email);
        return res.status(401).json({ message: 'El código de verificación ha expirado. Intenta loguearte de nuevo.' });
      }

      // Validar coincidencia del código
      if (cachedData.otpCode !== otp) {
        return res.status(401).json({ message: 'Código de verificación incorrecto.' });
      }

      // Si es correcto, recuperamos los datos del usuario para el Token
      const user = await UserModel.findById(cachedData.userId); // Asegúrate de tener este método en tu userModel
      
      // Borramos el OTP usado de la memoria por seguridad
      otpCache.delete(email);

      // EMISIÓN DEL TOKEN JWT FINAL
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        message: 'Autenticación de doble factor exitosa. ¡Bienvenido!',
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