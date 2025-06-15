const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

// Todas las rutas requieren autenticacion
router.use(auth);

// Rutas del carrito
router.get("/", getCart);
router.post("/", addItem);
router.put("/:id", updateItemQuantity);
router.delete("/:id", removeItem);
router.delete("/", clearCart);

module.exports = router;
