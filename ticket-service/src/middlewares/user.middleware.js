// Gateway'den gelen user bilgilerini request'e ekleyen middleware
const userMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const username = req.headers['x-user-username'];
  const email = req.headers['x-user-email'];
  const rolesHeader = req.headers['x-user-roles'];
  const name = req.headers['x-user-name'];

  if (userId) {
    req.user = {
      id: userId,
      username: username || '',
      email: email || '',
      roles: rolesHeader ? JSON.parse(rolesHeader) : [],
      name: name || ''
    };
  }

  next();
};

module.exports = userMiddleware;
