
const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");

const SALT_ROUNDS    = 12;
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env");
}

// Hash a plain-text password
const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

// Compare plain-text password against stored hash
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

// Short-lived access token (15 min)
const generateToken = (user) =>
  jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );

// Long-lived refresh token (7 days)
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

// Verify access token — throws if invalid/expired
const verifyToken = (token) => jwt.verify(token, ACCESS_SECRET);

// Verify refresh token — throws if invalid/expired
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
