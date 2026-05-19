const { Pool } = require('pg');

// Creamos el pool utilizando la URL que pusimos en el archivo .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Requerido obligatoriamente para conectarse de forma segura a servidores en la nube
    rejectUnauthorized: false 
  }
});

// Eventos de diagnóstico para saber si todo va bien en la terminal
pool.on('connect', () => {
  console.log('🚀 Base de datos PostgreSQL conectada con éxito.');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a la base de datos:', err);
  process.exit(-1); // Cierra el servidor si la base de datos falla catastróficamente
});

// Exportamos el método de consulta para usarlo en nuestros modelos de datos
module.exports = {
  query: (text, params) => pool.query(text, params),
};