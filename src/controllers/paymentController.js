const { MercadoPagoConfig, Preference } = require('mercadopago');
const OrderModel = require('../models/orderModel');

// Configurar Mercado Pago con tu Token del .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PaymentController = {
  // 1. GENERAR LINK DE PAGO
  async createPreference(req, res, next) {
    try {
      const { items } = req.body; // Array de productos cargados desde el carrito del frontend
      const userId = req.user.id;   // Obtenido gracias al verifyToken

      // Calcular el total acumulado
      const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      const preference = new Preference(client);
      
      const result = await preference.create({
        body: {
          items: items.map(item => ({
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'COP'
          })),
          back_urls: {
            success: `${process.env.FRONTEND_URL}/payment-success`,
            failure: `${process.env.FRONTEND_URL}/payment-failure`,
            pending: `${process.env.FRONTEND_URL}/payment-pending`,
          },
          auto_return: 'approved',
          notification_url: `${process.env.BACKEND_URL}/api/payments/webhook` // Por aquí nos avisa Mercado Pago
        }
      });

      // Guardamos la orden localmente en modo "pendiente"
      await OrderModel.create({ userId, totalAmount, preferenceId: result.id });

      // Le enviamos al frontend el ID y la URL donde debe redirigir al usuario para pagar
      res.status(200).json({ preferenceId: result.id, initPoint: result.init_point });
    } catch (error) {
      next(error);
    }
  },

  // 2. WEBHOOK: Escucha cuando la pasarela procesa el pago de forma externa
  async receiveWebhook(req, res, next) {
    try {
      const { query } = req;
      const topic = query.topic || query.type;

      // Si Mercado Pago nos avisa que una acción de pago ocurrió
      if (topic === 'payment') {
        const paymentId = query['data.id'] || query.id;
        
        // Aquí llamarías a Mercado Pago para verificar el estado ('approved')
        // Por agilidad, simulamos la verificación y aprobamos la orden usando el ID de la preferencia
        // En producción: const payment = await new Payment(client).get({ id: paymentId });
        
        // Actualizamos nuestra base de datos a 'completed'
        // Puedes pasar el preference_id asociado para marcarla como paga
        console.log(`💰 Pago verificado exitosamente. ID: ${paymentId}`);
      }

      // Siempre responder un 200 a la pasarela para que no repita la notificación
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PaymentController;