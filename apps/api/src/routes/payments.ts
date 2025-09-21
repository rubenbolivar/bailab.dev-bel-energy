import { Router } from 'express'
import { paymentController } from '../controllers/paymentController'

const router = Router()

// Procesamiento de pagos
router.post('/process', paymentController.processPayment.bind(paymentController))
router.post('/refund', paymentController.refundPayment.bind(paymentController))
router.post('/simulate', paymentController.simulatePayment.bind(paymentController))

// Consultas de estado y historial
router.get('/status/:gateway/:transactionId', paymentController.getPaymentStatus.bind(paymentController))
router.get('/history/:userId', paymentController.getTransactionHistory.bind(paymentController))
router.get('/stats', paymentController.getPaymentStats.bind(paymentController))
router.get('/gateways', paymentController.getAvailableGateways.bind(paymentController))

// Webhooks y conversiones
router.post('/webhook/:gateway', paymentController.handleWebhook.bind(paymentController))
router.get('/exchange-rates', paymentController.getExchangeRates.bind(paymentController))
router.post('/convert', paymentController.convertCurrency.bind(paymentController))

export default router