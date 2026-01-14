const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`🚀 Notification Service ${PORT} portunda çalışıyor`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Mail + Scheduler + Queue consumer aktif`);
});
