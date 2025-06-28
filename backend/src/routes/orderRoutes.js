const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");
const {
  createOrder,
  handleWebhook,
  testWebhook,
  getOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

// Rutas publicas, recibe webhooks de mp y procesa
router.post("/webhook", handleWebhook);
router.post("/test-webhook/:orderId", auth, checkRole(["ADMIN"]), testWebhook);

// Todas las rutas requieren autenticacion
router.use(auth);

// Rutas de admin
router.get("/", getOrders);
router.put("/:orderId/status", checkRole(["ADMIN"]), updateOrderStatus);

// Rutas de cliente
router.post("/", createOrder);
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
