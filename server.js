require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORTACIONES ÚNICAS DE RUTAS
const rutasAutenticacion = require('./src/routes/authRoutes');
const rutasProductos = require('./src/routes/productRoutes');
const rutasPayments = require('./src/routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

/** =========================================================================
 * CONFIGURACIÓN DE CORS FLEXIBLE Y SEGURA (Desarrollo y Producción)
 * ========================================================================= */
const allowedOrigins = [
  'http://localhost:5173',          // Tu entorno de desarrollo local con Vite
  'http://localhost:3000',          // Puerto alternativo local por si acaso
  'https://inventario-frontend.vercel.app' // URL de producción corregida (con 'nd')
];

// Si tienes configurado FRONTEND_URL en las variables de Render, la agregamos dinámicamente
if (process.env.FRONTEND_URL) {
  // Limpiamos barras inclinadas al final que puedan romper la validación de strings
  const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(cleanUrl)) {
    allowedOrigins.push(cleanUrl);
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Thunder Client, Postman o backend-to-backend)
    // O si el origen de la web que consulta está dentro de la lista permitida
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Origen rechazado por CORS: ${origin}`);
      callback(new Error('Acceso denegado por políticas de seguridad (CORS).'));
    }
  },
  credentials: true, // Permite el intercambio seguro de tokens, headers y cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/** =========================================================================
 * ENLAZAR RUTAS A LA API
 * ========================================================================= */
app.use('/api/auth', rutasAutenticacion);
app.use('/api/products', rutasProductos);
app.use('/api/payments', rutasPayments);

/** =========================================================================
 * RUTAS DE PRUEBA Y DIAGNÓSTICO
 * ========================================================================= */
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API del Sistema de Inventario de Partes Informáticas!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor operativo y escuchando peticiones.' 
  });
});

/** =========================================================================
 * MIDDLEWARE DE CONTROL DE ERRORES Global
 * ========================================================================= */
app.use((err, req, res, next) => {
  console.error('❌ Error interno detectado:', err.message);
  res.status(500).json({ 
    message: 'Ocurrió un problema en el servidor.',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

/** =========================================================================
 * ARRANQUE DEL SERVIDOR
 * ========================================================================= */
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`📡 Servidor encendido en el puerto: ${PORT}`);
  console.log(`💻 Entorno actual: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});