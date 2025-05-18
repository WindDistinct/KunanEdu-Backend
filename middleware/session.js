const { verifyToken } = require("../utils/handleJwt");

const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ").pop();
    const tokenData = await verifyToken(token);

    if (!tokenData) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = tokenData;
    next();
  } catch (err) {
    res.status(500).json({ error: "Error de autenticación" });
  }
};

module.exports = checkAuth;