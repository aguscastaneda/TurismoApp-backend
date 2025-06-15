const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const {
  createOrder,
  handleWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

// Rutas publicas
router.post("/webhook", handleWebhook);

// Todas las rutas requieren autenticacion
router.use(auth);

// Rutas de admin
router.get("/", checkRole(["SALES_MANAGER"]), getAllOrders);
router.put("/:orderId/status", checkRole(["SALES_MANAGER"]), updateOrderStatus);

// Rutas de cliente
router.get("/my-orders", getMyOrders);
router.post("/", createOrder);
router.post("/:orderId/cancel", cancelOrder);

module.exports = router;
