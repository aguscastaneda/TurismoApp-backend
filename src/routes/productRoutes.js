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

// Rutas protegidas (solo admin y sales manager)
router.post("/", auth, checkRole(["SALES_MANAGER", "ADMIN"]), createProduct);
router.put("/:id", auth, checkRole(["SALES_MANAGER", "ADMIN"]), updateProduct);
router.delete("/:id", auth, checkRole(["SALES_MANAGER", "ADMIN"]), deleteProduct);

module.exports = router;
