const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a JWT token with user id, username and role
 * @param {Object} payload - An object containing id, username, and role
 */
// When creating/signing the token
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id.toString(), // Convert ObjectId to string
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
