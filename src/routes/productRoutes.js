const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Rutas públicas (cualquier cliente o visitante puede ver el catálogo)
router.get('/', ProductController.getAllProducts);

// Rutas protegidas (más adelante les añadiremos seguridad para que solo el Admin pueda crear)
router.post('/', ProductController.createProduct);

module.exports = router;