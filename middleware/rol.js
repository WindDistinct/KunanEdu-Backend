function checkRol(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.user;

    if (!usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
    }

    next();
  };
}

module.exports = checkRol;