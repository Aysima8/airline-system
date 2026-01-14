# Queue + Notification + Scheduler System (Adım 7)

## Overview

Asenkron event-driven mimari ile bilet satın alma, miles kazanımı ve bildirim sistemi.

**Teknolojiler:**
- Bull (Redis-based queue)
- RabbitMQ (Event bus)
- Node-cron (Scheduler)
- Nodemailer (Email)

---

## Architecture

```
┌─────────────────┐
│ Ticket Service  │
│                 │
│ • Purchase      │──┐
│ • Miles Earn    │  │
└─────────────────┘  │
                     │
                     ├──> Bull Queue (Redis) ──┐
                     │                          │
┌─────────────────┐  │                          │
│ Miles Service   │  │                          │
│                 │  │                          │
│ • Add Miles     │──┘                          │
│ • Member.create │                             │
└─────────────────┘                             │
                                                │
                                                v
                                    ┌──────────────────────┐
                                    │ Notification Service │
                                    │                      │
                                    │ • Consumers          │
                                    │ • Email Service      │
                                    │ • Scheduler (Cron)   │
                                    └──────────────────────┘
```

---

## 1. Queue System (Bull + Redis)

### Queue Names

1. **notification-queue**: Bilet satın alma bildirimleri
2. **miles-queue**: Miles kazanımı bildirimleri
3. **welcome-queue**: Yeni üye karşılama

### Event Flow

#### Ticket Purchase Event
```javascript
// Ticket Service - After successful purchase
await ticketQueue.addNotificationJob({
  userId: 'uuid',
  ticketId: 'uuid',
  type: 'ticket_purchased',
  flightNumber: 'TK123',
  passengers: 2
});
```

#### Miles Earned Event
```javascript
// Ticket Service - After CARD purchase
await ticketQueue.addMilesJob({
  userId: 'uuid',
  memberNo: 'MS123456',
  ticketId: 'uuid',
  miles: 150,
  action: 'earn'
});
```

---

## 2. Notification Service Consumers

### Ticket Consumer

**Location:** `notification-service/src/consumers/ticket.consumer.js`

**Responsibilities:**
- Listen to `notification-queue`
- Send ticket purchase confirmation email
- Create in-app notification

**Code:**
```javascript
this.queue.process(async (job) => {
  const { userId, ticketId, type, flightNumber, passengers } = job.data;

  if (type === 'ticket_purchased') {
    await emailService.sendTicketPurchaseEmail(userId, ticketId, flightNumber, passengers);
    await notificationService.createNotification({
      userId,
      type: 'ticket_purchased',
      title: 'Bilet Satın Alındı!',
      message: `${flightNumber} uçuşu için ${passengers} yolcu biletiniz onaylandı.`
    });
  }
});
```

### Miles Consumer

**Location:** `notification-service/src/consumers/miles.consumer.js`

**Responsibilities:**
- Listen to `miles-queue` completed events
- Send miles earned email
- Create in-app notification

**Code:**
```javascript
this.queue.on('completed', async (job, result) => {
  const { userId, ticketId, miles } = job.data;

  await emailService.sendMilesAddedEmail(userId, miles);
  await notificationService.createNotification({
    userId,
    type: 'miles_added',
    title: 'Mil Kazandınız!',
    message: `${miles} mil hesabınıza eklendi.`
  });
});
```

### Welcome Consumer

**Location:** `notification-service/src/consumers/welcome.consumer.js`

**Responsibilities:**
- Listen to `welcome-queue`
- Send welcome email to new members

---

## 3. Email Templates

### Ticket Purchase Email
**Template:** `notification-service/src/templates/ticket-purchased.html`

**Variables:**
- `{{pnr}}`: Reservation code
- `{{flightNumber}}`: Flight number
- `{{passengers}}`: Passenger count
- `{{totalPrice}}`: Total price
- `{{paymentType}}`: CARD or Miles & Smiles

### Miles Added Email
**Template:** `notification-service/src/templates/miles-added.html`

**Variables:**
- `{{miles}}`: Miles earned
- `{{totalMiles}}`: Total miles balance

### Welcome Email
**Template:** `notification-service/src/templates/welcome.html`

**Variables:**
- `{{name}}`: User name

---

## 4. Nightly Scheduler (Cron Job)

**Schedule:** Every night at 02:00 AM
**Cron Expression:** `0 2 * * *`

### Tasks

#### 4.1 Process Completed Flights
```javascript
async processCompletedFlights() {
  // 1. Dünün tarihini al
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // 2. Ticket Service'den dünün biletlerini al
  const response = await axios.get(
    `${this.ticketServiceUrl}/api/tickets/completed`,
    { params: { date: dateStr } }
  );

  // 3. Her bilet için Miles & Smiles üyelerine miles ekle
  for (const ticket of completedTickets) {
    if (ticket.memberNo && ticket.paymentType === 'CARD') {
      const milesEarned = Math.floor(Math.random() * 500) + 200;

      // Miles ekle
      await axios.post(`${this.ticketServiceUrl}/api/miles/add`, {
        userId: ticket.userId,
        memberNo: ticket.memberNo,
        miles: milesEarned,
        reason: 'completed_flight'
      });

      // Email gönder
      await emailService.sendMilesAddedEmail(ticket.userId, milesEarned);
    }
  }
}
```

#### 4.2 Send Flight Reminders
- Find tomorrow's flights
- Send reminder emails to ticket holders

#### 4.3 Cleanup Old Notifications
- Delete notifications older than 30 days

#### 4.4 Generate Daily Report
- Email count, miles added, tickets sold

---

## 5. API Endpoints

### 5.1 Completed Tickets (Internal)
**GET** `/api/tickets/completed?date=YYYY-MM-DD`

**Auth:** Required (Service-to-service)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "flightId": "uuid",
      "memberNo": "MS123456",
      "paymentType": "CARD",
      "totalPrice": 5000,
      "status": "confirmed"
    }
  ]
}
```

### 5.2 Add Miles (Internal)
**POST** `/api/miles/add`

**Auth:** Required (Service-to-service)

**Body:**
```json
{
  "userId": "uuid",
  "memberNo": "MS123456",
  "miles": 200,
  "reason": "completed_flight",
  "ticketId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "200 mil eklendi",
  "data": {
    "userId": "uuid",
    "memberNo": "MS123456",
    "totalMiles": 1500,
    "availableMiles": 1200,
    "tier": "elite"
  }
}
```

### 5.3 Get User Miles
**GET** `/api/miles/me`

**Auth:** Required (User)

**Response:**
```json
{
  "success": true,
  "data": {
    "membershipNumber": "MS1234567890",
    "totalMiles": 1500,
    "availableMiles": 1200,
    "tier": "elite"
  }
}
```

---

## 6. Event Types

### ticket_purchased
Triggered when a user successfully purchases a ticket.

**Data:**
```javascript
{
  userId: 'uuid',
  ticketId: 'uuid',
  type: 'ticket_purchased',
  flightNumber: 'TK123',
  passengers: 2
}
```

### miles_added
Triggered when miles are added to user account.

**Data:**
```javascript
{
  userId: 'uuid',
  memberNo: 'MS123456',
  ticketId: 'uuid',
  miles: 150,
  action: 'earn'
}
```

### member_created
Triggered when a new Miles & Smiles member joins.

**Data:**
```javascript
{
  userId: 'uuid',
  email: 'user@example.com',
  name: 'John Doe',
  memberNo: 'MS123456'
}
```

---

## 7. Miles Calculation Rules

### Purchase Miles (CARD Payment)
- **Formula:** `Math.floor(totalPrice / 10)`
- **Example:** 5000 TL purchase = 500 miles

### Completed Flight Miles
- **Formula:** Random between 200-700 miles
- **Condition:** Only for CARD purchases with memberNo
- **Timing:** Nightly job (day after flight)

### Miles Tiers
- **Classic:** 0 - 24,999 miles
- **Elite:** 25,000 - 39,999 miles
- **Elite Plus:** 40,000+ miles

---

## 8. Configuration

### Environment Variables

**Notification Service:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@airline.com
FLIGHT_SERVICE_URL=http://localhost:3002
TICKET_SERVICE_URL=http://localhost:3003
```

**Ticket Service:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 9. Queue Configuration

### Retry Policy
```javascript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000 // 2s, 4s, 8s
  }
}
```

### Concurrency
- **notification-queue:** 5 concurrent jobs
- **miles-queue:** 3 concurrent jobs
- **welcome-queue:** 2 concurrent jobs

---

## 10. Testing Queue System

### Manual Test - Ticket Purchase
```bash
# 1. Start Redis
redis-server

# 2. Start Notification Service
cd notification-service
npm start

# 3. Purchase ticket via API
POST http://localhost:3000/api/tickets/buy
{
  "flightId": "uuid",
  "passengers": [{...}],
  "paymentType": "CARD"
}

# 4. Check logs
# Notification Service should log:
# ✅ Ticket purchase notification gönderildi
```

### Manual Test - Nightly Job
```bash
# Trigger manually (for testing)
# Change cron schedule to: '* * * * *' (every minute)

# Check logs after 1 minute:
# 🌙 Nightly job başladı
# ✈️ Tamamlanmış uçuşlar işleniyor...
# ✅ Miles eklendi: userId - 250 mil
```

---

## 11. Monitoring

### Queue Metrics
- Job completion rate
- Failed job count
- Average processing time
- Queue length

### Email Metrics
- Emails sent per day
- Delivery rate
- Bounce rate

### Scheduler Metrics
- Job execution time
- Success/failure count
- Miles distributed

---

## 12. Error Handling

### Failed Jobs
```javascript
this.queue.on('failed', (job, err) => {
  console.error(`Job başarısız: ${job.id}`, err);
  // TODO: Alert admin or retry manually
});
```

### Email Failures
- Log error
- Retry with backoff
- Alert after 3 failures

### Scheduler Failures
- Log error
- Send alert email to admin
- Continue with next task

---

## Summary

✅ **Queue System:** Bull + Redis için asenkron job processing
✅ **Consumers:** Ticket, Miles, Welcome event'lerini dinliyor
✅ **Email Service:** HTML template'li email gönderimi
✅ **Nightly Scheduler:** Her gece 02:00'de çalışan otomatik görevler
✅ **Miles Reward:** Tamamlanan uçuşlar için otomatik miles ekleme
✅ **Event-Driven:** Loosely coupled microservices architecture

**🎯 Şart Karşılandı:** Queue çözümü kullanıldı, scheduler gece çalışıyor, miles ekleme ve email bildirimleri asenkron olarak çalışıyor.
