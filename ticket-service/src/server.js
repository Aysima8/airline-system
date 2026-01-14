const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`🚀 Ticket Service ${PORT} portunda çalışıyor`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎫 Bilet satın alma + Miles & Smiles aktif`);
});
