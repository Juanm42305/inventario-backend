const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Crear la orden de compra requiere que el cliente esté logueado
router.post('/create-preference', verifyToken, PaymentController.createPreference);

// El webhook lo dejamos público porque Mercado Pago nos pegará desde sus propios servidores
router.post('/webhook', PaymentController.receiveWebhook);

module.exports = router;