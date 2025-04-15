const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const JWT = req.cookies.JWT;

  if (!JWT)
    return res.status(401).json({ success: false, message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(JWT, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = verifyToken;
