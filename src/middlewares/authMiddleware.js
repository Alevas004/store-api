// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const token = authHeader.split(" ")[1]; // Quita el 'Bearer'
    const decoded = jwt.verify(token, process.env.AUTH_SECRET); // Verifica token

    const user = await User.findByPk(decoded.id); // Busca usuario por ID del token
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // Lo adjunta para que esté disponible en la ruta
    next(); // Pasa al siguiente middleware o controlador
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = protect;
