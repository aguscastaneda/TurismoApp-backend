const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Todas las rutas requieren autenticacion
router.use(auth);

// Rutas del carrito
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
