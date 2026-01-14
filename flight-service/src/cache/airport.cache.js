const redis = require('redis');
const Airport = require('../models/airport.model');

class AirportCache {
  constructor() {
    this.client = null;
    this.isRedisAvailable = false;
    this.cacheKey = 'airports:all';
    this.cacheTTL = 3600; // 1 saat
    this.memoryCache = null; // Redis olmadığında memory cache kullan
  }

  // Redis bağlantısı
  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        console.error('Redis bağlantı hatası:', err);
        this.isRedisAvailable = false;
      });

      await this.client.connect();
      this.isRedisAvailable = true;
      console.log('✅ Redis bağlantısı başarılı');
    } catch (error) {
      console.warn('⚠️ Redis kullanılamıyor, memory cache kullanılacak');
      this.isRedisAvailable = false;
    }
  }

  // Havaalanlarını cache'e yükle (warm up)
  async warmUp() {
    try {
      // Önce cache'den kontrol et
      const cached = await this.get();
      if (cached) {
        return cached;
      }

      // Cache'de yoksa veritabanından çek
      const airports = await Airport.findAll();

      // Cache'e kaydet
      await this.set(airports);

      return airports;
    } catch (error) {
      console.error('Airport cache warm up hatası:', error);
      return [];
    }
  }

  // Cache'den oku
  async get() {
    try {
      if (this.isRedisAvailable) {
        const data = await this.client.get(this.cacheKey);
        return data ? JSON.parse(data) : null;
      } else {
        // Memory cache kullan
        return this.memoryCache;
      }
    } catch (error) {
      console.error('Cache okuma hatası:', error);
      return null;
    }
  }

  // Cache'e yaz
  async set(data) {
    try {
      if (this.isRedisAvailable) {
        await this.client.setEx(
          this.cacheKey,
          this.cacheTTL,
          JSON.stringify(data)
        );
      } else {
        // Memory cache kullan
        this.memoryCache = data;
      }
    } catch (error) {
      console.error('Cache yazma hatası:', error);
    }
  }

  // Cache'i temizle
  async clear() {
    try {
      if (this.isRedisAvailable) {
        await this.client.del(this.cacheKey);
      } else {
        this.memoryCache = null;
      }
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
    }
  }
}

module.exports = new AirportCache();
