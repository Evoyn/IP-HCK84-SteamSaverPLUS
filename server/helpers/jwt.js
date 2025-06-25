const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (obj) => {
  return jwt.sign(obj, JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
