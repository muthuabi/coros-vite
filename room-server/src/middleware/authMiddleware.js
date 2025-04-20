const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const JWT = req.cookies?.JWT || req.headers?.authorization?.split(" ")[1];

  if (!JWT) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(JWT, JWT_SECRET);
    // console.log(decoded);
    let userId;
    if (Buffer.isBuffer(decoded._id)) {
      userId = Buffer.from(decoded._id).toString('hex');
    } else {
      userId = decoded._id;
    }
    req.user={...decoded,_id:userId};
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
