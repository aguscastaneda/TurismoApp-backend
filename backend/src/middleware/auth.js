const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "No se proporciono token de autenticacion" });
    }

    console.log("Verificando token:", token.substring(0, 20) + "...");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log("Usuario no encontrado para ID:", decoded.userId);
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    console.log("Usuario autenticado:", { id: user.id, email: user.email, role: user.role });
    req.user = user;
    next();
  } catch (error) {
    console.error("Error de autenticacion:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token invalido" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    res.status(401).json({ error: "Por favor autentiquese" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }
    next();
  };
};

module.exports = {
  auth,
  checkRole,
};
