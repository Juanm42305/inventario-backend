const db = require('../config/db');

const ProductModel = {
  // 1. Obtener todos los productos del inventario
  async getAll() {
    const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC;');
    return rows;
  },

  // 2. Buscar un producto específico por su ID
  async getById(id) {
    const { rows } = await db.query('SELECT * FROM products WHERE id = $1;', [id]);
    return rows[0];
  },

  // 3. Crear un nuevo componente en el inventario
  async create({ name, description, price, stock, category, imageUrl }) {
    const queryText = `
      INSERT INTO products (name, description, price, stock, category, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [name, description, price, stock, category, imageUrl];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  // 4. Actualizar los datos de un producto existente
  async update(id, { name, description, price, stock, category, imageUrl }) {
    const queryText = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const values = [name, description, price, stock, category, imageUrl, id];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  // 5. Eliminar un producto por completo
  async delete(id) {
    const { rows } = await db.query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);
    return rows[0];
  }
};

module.exports = ProductModel;