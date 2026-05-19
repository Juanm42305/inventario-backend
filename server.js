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
 * CONFIGURACIÓN DE CORS RESTRINGIDA (Seguridad total para Producción)
 * ========================================================================= */
const allowedOrigins = [
  'https://inventario-fronted.vercel.app', // Tu entorno de desarrollo local
  process.env.FRONTEND_URL // La URL privada de tu despliegue en Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Si la petición no tiene origen (como herramientas del servidor o llamadas internas)
    // o si el origen está en nuestra lista permitida, dejamos pasar la petición.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por políticas de seguridad (CORS).'));
    }
  },
  credentials: true, // Permite el intercambio seguro de tokens y cookies si fuera necesario
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