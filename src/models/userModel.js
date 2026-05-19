const db = require('../config/db');

const UserModel = {
  // Buscar usuario por correo electrónico (para el Login y verificación)
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1;', [email]);
    return rows[0];
  },

  // Registrar el usuario en la base de datos
  async create({ name, email, passwordHash, role }) {
    const queryText = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role;
    `;
    const values = [name, email, passwordHash, role];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  }
};

module.exports = UserModel;