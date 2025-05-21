const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRET_KEY; 
const tokensign = async (user) => { 
  const sign = jwt.sign(
    {
      id: user.id_usuario,
      rol: user.rol,
      usuario:user.usuario
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
  return sign;
};
const verifyToken = async (tokenJWT) => {
  try {
    return jwt.verify(tokenJWT, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports={tokensign,verifyToken}