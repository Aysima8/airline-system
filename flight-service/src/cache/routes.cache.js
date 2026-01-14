const redis = require('redis');
const flightRepository = require('../repositories/flight.repository');

class RoutesCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.CACHE_TTL = 3600; // 1 saat (popular routes sık değişmez)
    this.CACHE_KEY = 'popular_routes';
  }

  // Redis bağlantısı
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = redis.createClient({
        url: redisUrl
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Routes Cache Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Routes Cache Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  // Popular routes cache'i güncelle
  async refreshPopularRoutes(limit = 10) {
    try {
      if (!this.isConnected) {
        console.log('⚠️ Redis not connected, skipping cache refresh');
        return null;
      }

      // Database'den popular routes'u çek
      const routes = await flightRepository.getPopularRoutes(limit);

      // Redis'e kaydet
      await this.client.setEx(
        this.CACHE_KEY,
        this.CACHE_TTL,
        JSON.stringify(routes)
      );

      console.log(`✅ Popular routes cached (${routes.length} routes)`);
      return routes;
    } catch (error) {
      console.error('❌ Popular routes cache refresh error:', error);
      return null;
    }
  }

  // Popular routes'u cache'den oku
  async getPopularRoutes() {
    try {
      if (!this.isConnected) {
        console.log('⚠️ Redis not connected, fetching from DB');
        return await flightRepository.getPopularRoutes(10);
      }

      // Cache'den oku
      const cached = await this.client.get(this.CACHE_KEY);

      if (cached) {
        console.log('✅ Popular routes from cache');
        return JSON.parse(cached);
      }

      // Cache miss - database'den al ve cache'le
      console.log('⚠️ Cache miss, refreshing popular routes');
      return await this.refreshPopularRoutes();
    } catch (error) {
      console.error('❌ Popular routes cache read error:', error);
      // Fallback to database
      return await flightRepository.getPopularRoutes(10);
    }
  }

  // Warm up - uygulama başlarken cache'i doldur
  async warmUp() {
    try {
      console.log('🔥 Warming up popular routes cache...');
      await this.refreshPopularRoutes();
    } catch (error) {
      console.error('❌ Routes cache warm up failed:', error);
    }
  }

  // Cache'i temizle
  async clear() {
    try {
      if (!this.isConnected) return;
      await this.client.del(this.CACHE_KEY);
      console.log('✅ Popular routes cache cleared');
    } catch (error) {
      console.error('❌ Routes cache clear error:', error);
    }
  }

  // Bağlantıyı kapat
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        console.log('✅ Routes Cache Redis disconnected');
      }
    } catch (error) {
      console.error('❌ Routes Cache Redis disconnect error:', error);
    }
  }
}

module.exports = new RoutesCache();
