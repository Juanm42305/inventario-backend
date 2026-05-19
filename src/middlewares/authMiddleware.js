const jwt = require('jsonwebtoken');

const AuthMiddleware = {
  // 1. Verificar si el usuario inició sesión de verdad (Validar Token)
  verifyToken(req, res, next) {
    // Buscamos el token en las cabeceras de la petición (Authorization: Bearer TOKEN)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Corta la palabra "Bearer" y se queda con el token

    if (!token) {
      return res.status(403).json({ message: 'Acceso denegado. No se proporcionó un token de autenticación.' });
    }

    try {
      // Validamos el token usando la palabra secreta de tu archivo .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Guardamos los datos decoded (id y role) dentro de la petición (req) para que el siguiente paso los use
      req.user = decoded;
      
      next(); // Si el token es real, lo dejamos pasar al controlador
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }
  },

  // 2. Verificar si el usuario tiene permisos de Administrador
  isAdmin(req, res, next) {
    // Este middleware se ejecuta DESPUÉS de verifyToken, por lo que req.user ya existe
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
    next(); // Si es admin, lo dejamos pasar a crear, editar o borrar
  }
};

module.exports = AuthMiddleware;