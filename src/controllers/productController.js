const ProductModel = require('../models/productModel');

const ProductController = {
  // Listar inventario completo
  async getAllProducts(req, res, next) {
    try {
      const products = await ProductModel.getAll();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  // Crear un producto nuevo con validaciones básicas de negocio
  async createProduct(req, res, next) {
    try {
      const { name, description, price, stock, category, imageUrl } = req.body;

      if (!name || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ message: 'Los campos nombre, precio, stock y categoría son obligatorios.' });
      }

      if (price < 0 || stock < 0) {
        return res.status(400).json({ message: 'El precio y el stock no pueden ser valores negativos.' });
      }

      const newProduct = await ProductModel.create({ name, description, price, stock, category, imageUrl });
      res.status(201).json({ message: 'Producto agregado al inventario.', product: newProduct });
    } catch (error) {
      next(error);
    }
  },

  // Los demás métodos (update, delete, getById) siguen la misma lógica llamando al Modelo...
};

module.exports = ProductController;