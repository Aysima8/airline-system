const app = require('./app');
const { PORT } = require('./config/env');

// App.listen - sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 API Gateway ${PORT} portunda çalışıyor`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
