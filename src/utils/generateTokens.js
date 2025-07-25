const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.AUTH_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = generateToken;
