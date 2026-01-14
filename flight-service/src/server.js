const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`🚀 Flight Service ${PORT} portunda çalışıyor`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`✈️ Uçuş ekleme + arama + kapasite kontrolü aktif`);
});
