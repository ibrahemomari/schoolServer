const jwt = require('jsonwebtoken');

const authMiddleware = (role) => (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    if (role && req.user.role !== role) {
      return res.status(403).json({ message: 'Access Forbidden' });
    }

    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;
