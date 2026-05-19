require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 10000;

/** =========================================================================
 *  MIDDLEWARES GLOBALES (Validaciones de seguridad y formato básicas)
 *  ========================================================================= */

// CORS permite que tu frontend en Vercel pueda hacerle preguntas a tu backend en Render
app.use(cors());

// Permite que tu servidor entienda cuando el frontend le mande datos en formato JSON (ej. formularios)
app.use(express.json());

/** =========================================================================
 *  RUTAS DE PRUEBA Y DIAGNÓSTICO
 *  ========================================================================= */

// Ruta de bienvenida básica
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API del Sistema de Inventario de Partes Informáticas!');
});

// Ruta "Health" (Salud del servidor): Render la usa para verificar que tu app no se ha caído
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor operativo y escuchando peticiones.' 
  });
});

// IMPORTAR RUTAS
const authRoutes = require('./src/routes/authRoutes');

// MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// ENLAZAR RUTAS A LA API
app.use('/api/auth', authRoutes); // <-- Añade esta línea

/** =========================================================================
 *  MIDDLEWARE DE CONTROL DE ERRORES (Evita que el servidor se caiga)
 *  ========================================================================= */
app.use((err, req, res, next) => {
  console.error('❌ Error interno detectado:', err.message);
  res.status(500).json({ 
    message: 'Ocurrió un problema en el servidor.',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

/** =========================================================================
 *  ARRANQUE DEL SERVIDOR
 *  ========================================================================= */
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`📡 Servidor encendido en el puerto: ${PORT}`);
  console.log(`💻 Entorno actual: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});