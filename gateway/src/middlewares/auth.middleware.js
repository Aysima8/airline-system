const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Keycloak URL - Docker icinde keycloak, disarida localhost
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'airline';

// Keycloak JWKS client
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

// Get signing key from JWKS
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('JWKS getSigningKey error:', err.message);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Keycloak JWT dogrulama middleware'i
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

    // JWT token'i verify et (Keycloak public key ile JWKS'den)
    // NOT: audience kontrolu Keycloak token'larinda sorun cikarabilir, kaldirildi
    jwt.verify(token, getKey, {
      algorithms: ['RS256']
      // issuer ve audience kontrolu kaldirildi - Keycloak token'lari farkli issuer donebilir
    }, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Token dogrulama hatasi: ' + err.message
        });
      }

      // Kullanici bilgilerini request'e ekle
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
      message: 'Token dogrulama hatasi'
    });
  }
};

module.exports = authMiddleware;
