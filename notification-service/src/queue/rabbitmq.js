const amqp = require('amqplib');

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
  }

  // RabbitMQ bağlantısı
  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Exchange'leri oluştur
      await this.channel.assertExchange('notification.events', 'topic', {
        durable: true
      });

      console.log('✅ RabbitMQ bağlantısı başarılı');
      return true;
    } catch (error) {
      console.error('❌ RabbitMQ bağlantı hatası:', error.message);
      return false;
    }
  }

  // Event publish et
  async publishEvent(routingKey, message) {
    try {
      if (!this.channel) {
        console.warn('RabbitMQ bağlantısı yok, event gönderilemedi');
        return false;
      }

      this.channel.publish(
        'notification.events',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      console.log(`📤 Event yayınlandı: ${routingKey}`);
      return true;
    } catch (error) {
      console.error('Event publish hatası:', error);
      return false;
    }
  }

  // Event dinle
  async consumeEvents(queueName, routingKeys, callback) {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ bağlantısı yok');
      }

      // Queue oluştur
      await this.channel.assertQueue(queueName, { durable: true });

      // Routing key'leri bind et
      for (const key of routingKeys) {
        await this.channel.bindQueue(queueName, 'notification.events', key);
      }

      // Mesajları tüket
      this.channel.consume(queueName, async (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg.fields.routingKey);
          this.channel.ack(msg);
        }
      });

      console.log(`✅ Queue dinleniyor: ${queueName}`);
    } catch (error) {
      console.error('Event consume hatası:', error);
    }
  }

  // Bağlantıyı kapat
  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('RabbitMQ bağlantısı kapatıldı');
    } catch (error) {
      console.error('RabbitMQ kapatma hatası:', error);
    }
  }
}

module.exports = new RabbitMQ();
