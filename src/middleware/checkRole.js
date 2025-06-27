const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: "No tiene permiso para realizar esta accion" });
      }

      next();
    } catch (error) {
      console.error("Error al verificar rol:", error);
      res.status(500).json({ error: "Error al verificar permisos" });
    }
  };
};

module.exports = { checkRole };
