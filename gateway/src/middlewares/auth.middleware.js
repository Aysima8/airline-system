const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Keycloak JWKS client
const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/airline/protocol/openid-connect/certs',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

// Get signing key from JWKS
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Keycloak JWT doğrulama middleware'i
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token gerekli'
      });
    }

    const token = authHeader.substring(7);

    // JWT token'ı verify et (Keycloak public key ile JWKS'den)
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/airline',
      audience: process.env.KEYCLOAK_AUDIENCE || 'account'
    }, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({
          success: false,
          message: 'Token doğrulama hatası: ' + err.message
        });
      }

      // Kullanıcı bilgilerini request'e ekle
      req.user = {
        id: decoded.sub,
        username: decoded.preferred_username,
        email: decoded.email,
        roles: decoded.realm_access?.roles || [],
        clientRoles: decoded.resource_access || {},
        name: decoded.name || decoded.preferred_username
      };

      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token doğrulama hatası'
    });
  }
};

module.exports = authMiddleware;
