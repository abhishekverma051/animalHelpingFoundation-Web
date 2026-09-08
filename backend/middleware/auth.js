import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'animal-ngo-secret-key-2026';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'animal-ngo-secret-key-2026')) {
  console.warn('⚠️ WARNING: Using default JWT secret in production mode. Set process.env.JWT_SECRET for maximum security.');
}

export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Security token missing or invalid authorization header.' 
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Malformed authentication token.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin session expired. Please log in again.' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Security validation failed. Invalid authentication token.' 
    });
  }
};
