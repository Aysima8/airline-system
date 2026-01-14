// In-app notification servisi
// Kullanıcılara uygulama içi bildirim göstermek için

class NotificationService {
  constructor() {
    this.notifications = []; // Basit memory storage (production'da DB kullanılır)
  }

  // Yeni notification oluştur
  async createNotification({ userId, type, title, message, data }) {
    const notification = {
      id: this.generateId(),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    console.log(`✅ Notification oluşturuldu: ${userId} - ${type}`);

    return notification;
  }

  // Kullanıcının notification'larını getir
  async getUserNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId);
  }

  // Notification'ı okundu olarak işaretle
  async markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Tüm notification'ları okundu işaretle
  async markAllAsRead(userId) {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  }

  // ID oluştur
  generateId() {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new NotificationService();
