const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { auth, checkRole } = require("../middleware/auth");

const router = express.Router();

// Rutas publicas
router.get("/", getProducts);
router.get("/:id", getProduct);

// Rutas protegidas (solo admin)
router.post("/", auth, checkRole(["ADMIN"]), createProduct);
router.put("/:id", auth, checkRole(["ADMIN"]), updateProduct);
router.delete("/:id", auth, checkRole(["ADMIN"]), deleteProduct);

module.exports = router;
