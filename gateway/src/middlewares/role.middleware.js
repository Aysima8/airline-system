// Role-based access control middleware

/**
 * Check if user has required role(s)
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @param {boolean} requireAll - If true, user must have all roles. If false, user needs at least one role.
 */
const requireRole = (requiredRoles, requireAll = false) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user roles from token (array)
      const userRoles = req.user.roles || [];

      if (userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Kullanıcı rolü bulunamadı'
        });
      }

      // Convert single role to array
      const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check if user has required role(s)
      let hasAccess = false;

      if (requireAll) {
        // User must have ALL required roles
        hasAccess = rolesToCheck.every(role => userRoles.includes(role));
      } else {
        // User needs at least ONE of the required roles
        hasAccess = rolesToCheck.some(role => userRoles.includes(role));
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için yetkiniz yok. Gerekli rol(ler): ' + rolesToCheck.join(', '),
          userRoles: userRoles
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Rol kontrolünde hata oluştu'
      });
    }
  };
};

/**
 * Require ADMIN role
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Require USER role (standard user)
 */
const requireUser = requireRole('USER');

/**
 * Require SERVICE role (for service-to-service communication)
 */
const requireService = requireRole('SERVICE');

/**
 * Require either ADMIN or SERVICE role
 */
const requireAdminOrService = requireRole(['ADMIN', 'SERVICE'], false);

// Legacy export for backward compatibility
const roleMiddleware = requireRole;

module.exports = {
  requireRole,
  requireAdmin,
  requireUser,
  requireService,
  requireAdminOrService,
  roleMiddleware // Backward compatibility
};
