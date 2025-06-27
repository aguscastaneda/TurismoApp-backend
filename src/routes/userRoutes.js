const express = require("express");
const router = express.Router();
const { register, login, getMe, googleAuth } = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// Rutas publicas
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

// Rutas protegidas
router.get("/me", auth, getMe);

module.exports = router;
