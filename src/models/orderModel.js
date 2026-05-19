const db = require('../config/db');

const OrderModel = {
  // Crear una orden en estado "pendiente"
  async create({ userId, totalAmount, preferenceId }) {
    const queryText = `
      INSERT INTO orders (user_id, total_amount, preference_id, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [userId, totalAmount, preferenceId]);
    return rows[0];
  },

  // Actualizar el estado cuando la pasarela avise que ya pagaron
  async updateStatus(preferenceId, status) {
    const queryText = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE preference_id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [status, preferenceId]);
    return rows[0];
  }
};

module.exports = OrderModel;