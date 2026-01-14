# Airline System - Microservices Architecture

Modern airline reservation system -> developed with microservices architecture and containerized using Docker.

##  Architecture

```
┌─────────────┐
│  Frontend   │ (React + Vite)
│  (Port 80)  │
└──────┬──────┘
       │
┌──────▼──────┐
│  Gateway    │ (Express.js)
│ (Port 3000) │
└──────┬──────┘
       │
   ┌───┴───────────────────────┐
   │                           │
┌──▼──────────┐    ┌──────────▼─────┐
│Flight Service│    │Ticket Service  │
│ (Port 3002)  │    │ (Port 3003)    │
└──────┬───────┘    └────────┬───────┘
       │                     │
       │    ┌────────────────┘
       │    │
   ┌───▼────▼─────┐    ┌──────────────┐
   │ML Price Svc  │    │Notification  │
   │ (Port 5000)  │    │  Service     │
   └──────────────┘    │ (Port 3004)  │
                       └──────────────┘

┌─────────────────────────────────────────────────┐
│         Infrastructure Services                 │
├─────────────────────────────────────────────────┤
│ PostgreSQL │ Redis │ RabbitMQ │ Keycloak (IAM) │
│ (Port 5432)│ (6379)│  (5672)  │    (8080)      │
└─────────────────────────────────────────────────┘
```

## Özellikler

### Servisler

1. **API Gateway** (Port 3000)
   - Tek giriş noktası
   - JWT authentication
   - Request routing
   - Rate limiting

2. **Flight Service** (Port 3002)
   - Uçuş ekleme/arama
   - Kapasite kontrolü
   - Redis cache
   - ML fiyat entegrasyonu

3. **Ticket Service** (Port 3003)
   - Bilet satın alma
   - Miles & Smiles
   - Payment mock
   - Queue ile asenkron işlemler

4. **Notification Service** (Port 3004)
   - Email gönderimi
   - RabbitMQ consumer
   - Scheduler (gece çalışan tasklar)
   - In-app notifications

5. **ML Price Service** (Port 5000)
   - FastAPI
   - Linear Regression
   - Dinamik fiyatlandırma
   - Clean_Dataset.csv ile eğitim

6. **Frontend** (Port 80)
   - React + Vite
   - React Router
   - Axios
   - Modern UI

### Altyapı

- **Keycloak**: Identity and Access Management (IAM) - Authentication & Authorization
- **PostgreSQL**: Veritabanı
- **Redis**: Cache ve session
- **RabbitMQ**: Message broker
- **Docker**: Containerization
- **Nginx**: Frontend web server

##  Authentication (Keycloak IAM)

Proje **Keycloak** kullanarak IAM (Identity and Access Management) sağlar.

### Önceden Tanımlı Kullanıcılar

| Kullanıcı | Şifre | Roller | Yetkiler |
|-----------|-------|--------|----------|
| `admin` | `admin123` | ADMIN, USER | Uçuş ekleme/düzenleme + tüm USER yetkileri |
| `user` | `user123` | USER | Uçuş arama, bilet satın alma |
| `service-account` | `service123` | SERVICE | Other airlines API erişimi |

### Keycloak Admin Panel
- **URL**: http://localhost:8080
- **Admin Kullanıcı**: `admin` / `admin`

**Detaylı bilgi**: [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)

## Kurulum

### Gereksinimler

- Docker 20.10+
- Docker Compose 2.0+

### Hızlı Başlangıç

```bash
# 1. Repoyu klonla
git clone <repo-url>
cd airline-system

# 2. Environment dosyasını oluştur
cp .env.example .env

# 3. Docker Compose ile başlat
docker compose up --build

# 4. Servisleri kontrol et
docker compose ps
```

### İlk Kez Çalıştırma

```bash
# Tüm servisleri build et ve başlat
docker compose up --build -d

# Logları takip et
docker compose logs -f

# Sadece belirli bir servisin logunu izle
docker compose logs -f flight-service
```

## 🔗 Erişim URL'leri

| Servis | URL | Açıklama |
|--------|-----|----------|
| Frontend | http://localhost | React UI |
| Gateway | http://localhost:3000 | API Gateway |
| **Keycloak IAM** | **http://localhost:8080** | **IAM Admin Panel (admin/admin)** |
| Flight Service | http://localhost:3002 | Uçuş servisi |
| Ticket Service | http://localhost:3003 | Bilet servisi |
| Notification | http://localhost:3004 | Bildirim servisi |
| ML Service | http://localhost:5000 | ML fiyat servisi |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| RabbitMQ UI | http://localhost:15672 | Queue yönetimi (guest/guest) |

##  API Dokümantasyonu

### Gateway Endpoints

```
POST   /api/auth/login          - Kullanıcı girişi
POST   /api/auth/register       - Kullanıcı kaydı
GET    /api/flights/search      - Uçuş arama
POST   /api/flights             - Uçuş ekleme (Admin)
POST   /api/tickets/purchase    - Bilet satın alma
GET    /api/tickets/user        - Kullanıcı biletleri
```

### ML Service Endpoints

```
GET    /health                  - Health check
POST   /predict                 - Fiyat tahmini
POST   /train                   - Model eğitimi
GET    /docs                    - Swagger UI
```

## 🛠️ Geliştirme

### Lokal Geliştirme

```bash
# Sadece altyapı servislerini başlat
docker compose up postgres redis rabbitmq -d

# Backend servisleri lokal çalıştır
cd gateway && npm run dev
cd flight-service && npm run dev
cd ticket-service && npm run dev

# Frontend lokal çalıştır
cd frontend && npm run dev

# ML servis lokal çalıştır
cd ml-price-service/src && python api.py
```

### Servis Durdurma

```bash
# Tüm servisleri durdur
docker compose down

# Volumeleri de sil (dikkat: veri kaybı!)
docker compose down -v

# Sadece belirli bir servisi yeniden başlat
docker compose restart flight-service
```

### Log İzleme

```bash
# Tüm loglar
docker compose logs -f

# Son 100 satır
docker compose logs --tail=100

# Belirli servis
docker compose logs -f gateway
```

##  Test

```bash
# Health check tüm servisler
curl http://localhost:3000/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:5000/health

# ML servis test
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "airline": "SpiceJet",
    "source_city": "Delhi",
    "destination_city": "Mumbai",
    "departure_time": "Morning",
    "stops": "zero",
    "arrival_time": "Afternoon",
    "flight_class": "Economy",
    "duration": 2.17,
    "days_left": 7
  }'
```

##  Monitoring

### Container Status

```bash
# Container durumları
docker compose ps

# Resource kullanımı
docker stats

# Container içine gir
docker exec -it airline-gateway sh
```

### Database Erişimi

```bash
# PostgreSQL'e bağlan
docker exec -it airline-postgres psql -U postgres -d airline_db

# Redis'e bağlan
docker exec -it airline-redis redis-cli

# RabbitMQ Management UI
# http://localhost:15672 (guest/guest)
```

##  Troubleshooting

### Port Çakışması

```bash
# Kullanılan portları kontrol et
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Docker Compose portları değiştir
# docker-compose.yml'de ports bölümünü düzenle
```

### Container Başlamıyor

```bash
# Logları kontrol et
docker compose logs service-name

# Container'ı yeniden build et
docker compose build --no-cache service-name
docker compose up service-name
```

### Database Bağlantı Hatası

```bash
# PostgreSQL health check
docker exec airline-postgres pg_isready -U postgres

# Connection string kontrolü
docker compose logs flight-service | grep "database"
```

## 📂 Proje Yapısı

```
airline-system/
├── gateway/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── flight-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── ticket-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── notification-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── ml-price-service/
│   ├── src/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```


##  Deployment Status

### Current Status: **LOCAL DEVELOPMENT ONLY**

**⚠️ NOT YET DEPLOYED TO PRODUCTION**

This project is currently configured for local development. Production deployment is planned but not yet implemented.

### Planned Deployment Architecture

**User Domain (airlines.com):**
- Frontend (React)
- User-facing pages (Search, Buy, My Tickets)
- Route: `/`

**Admin Domain (admin.airlines.com):**
- Admin panel (separate build or route-based)
- Admin-only pages (Add Flight, Manage System)
- Route: `/admin/*`

**Current Implementation:**
- ✅ Route-based separation (`/admin/*` routes)
- ✅ Role-based access control (ADMIN role required)
- ✅ Dark theme for admin pages
-  Separate domain deployment (planned, not implemented)
-  Production hosting (planned, not implemented)

**To Deploy Separately:**
1. Build two frontend versions:
   - User build: `npm run build` (exclude admin routes)
   - Admin build: `npm run build:admin` (only admin routes)
2. Deploy to separate domains:
   - `airlines.com` → User build
   - `admin.airlines.com` → Admin build
3. Configure DNS and SSL certificates
4. Update CORS and API endpoints

**Current Workaround:**
- Single app with `/admin` route prefix
- All features work locally
- Can be deployed to single domain for now

### Production Checklist (TODO)

**Infrastructure:**
- [ ] AWS/Azure/GCP account setup
- [ ] Domain registration (airlines.com)
- [ ] SSL certificates
- [ ] Load balancer configuration
- [ ] CDN setup (CloudFlare/AWS CloudFront)

**Services:**
- [ ] Deploy Gateway (API)
- [ ] Deploy microservices (Flight, Ticket, ML, etc.)
- [ ] Deploy frontend (User + Admin)
- [ ] Setup Keycloak (production instance)
- [ ] Configure PostgreSQL (managed instance)
- [ ] Configure Redis (managed instance)
- [ ] Setup message queue (RabbitMQ/AWS SQS)

**Security:**
- [ ] Environment variables in secret manager
- [ ] API rate limiting
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall)
- [ ] Database encryption
- [ ] Backup strategy

**Monitoring:**
- [ ] Application monitoring (New Relic/DataDog)
- [ ] Log aggregation (ELK/CloudWatch)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### Local URLs

**Current (Development):**
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Keycloak: http://localhost:8080
- Admin Panel: http://localhost:5173/admin/add-flight

**Planned (Production - Not Deployed):**
- User: https://airlines.com
- Admin: https://admin.airlines.com (or https://airlines.com/admin)
- API: https://api.airlines.com
- Keycloak: https://auth.airlines.com

---

## Security & Authentication

### Keycloak IAM - Production-Ready

** Proper JWT Verification Implemented:**
- JWT verification with JWKS (not just decode!)
- RS256 asymmetric algorithm
- Issuer validation
- Audience validation
- Token expiry check

**Keycloak Configuration:**
- Realm: `airline`
- Roles: `USER`, `ADMIN`, `SERVICE`
- User Client: `airline-web` (public - for frontend)
- Service Client: `notification-service` (confidential - for scheduler)

**See:** [KEYCLOAK_SETUP.md](docs/KEYCLOAK_SETUP.md) for complete setup guide

**Service-to-Service Authentication:**
- Scheduler uses SERVICE role
- Client credentials grant type
- Token cached with expiry check
- `/api/v1/miles/add` requires SERVICE role

---

**Not**: Bu proje eğitim amaçlıdır. Production deployment için yukarıdaki checklist'i tamamlayın.

---

## Architecture Details & Design Decisions

### Queue Architecture: RabbitMQ + Bull/Redis

**Why both RabbitMQ and Bull/Redis?**

The system uses **two complementary queueing systems** for different purposes:

**1. RabbitMQ (Message Broker)**
- **Use Case**: Service-to-service async communication
- **Purpose**: Decoupling between microservices
- **Example**: `welcome-queue` - Gateway → Notification Service
- **Benefits**:
  - Reliable message delivery
  - Message persistence
  - Service independence
  - Fanout to multiple consumers

**2. Bull + Redis (Job Queue)**
- **Use Case**: Background job processing within a service
- **Purpose**: Internal async tasks with retries and scheduling
- **Example**: `miles-queue`, `notification-queue` in Ticket Service
- **Benefits**:
  - Job prioritization
  - Delayed jobs
  - Automatic retries with exponential backoff
  - Job progress tracking
  - Cron-like scheduling

**Real-World Analogy:**
- **RabbitMQ** = Post Office (delivers messages between cities/services)
- **Bull/Redis** = Task Manager (manages work within a single office/service)

**Architecture:**
```
Gateway --[RabbitMQ]--> Notification Service
                         (receives welcome emails)

Ticket Service:
  └─> Purchase Ticket
      ├─> [Bull Queue] Add Miles Job (retry 3x)
      └─> [Bull Queue] Send Email Job (retry 3x)
```

### Miles Calculation - Deterministic Formula

**Implementation:** Deterministic (predictable, repeatable)

**Formula:**
```javascript
// Method 1: Distance-based (preferred)
miles = distance_km * cabin_multiplier
  - Economy: 1.0x
  - Business: 1.5x
  - First Class: 2.0x

// Method 2: Price-based (fallback)
miles = price * cabin_multiplier
  - Economy: 0.1 (10%)
  - Business: 0.15 (15%)
  - First: 0.2 (20%)
```

**Why Deterministic?**
- ✅ Predictable: Same flight = same miles
- ✅ Testable: Easy to write unit tests
- ✅ Fair: Users know exactly what they'll earn
- ✅ Auditable: Miles calculations can be verified

**Assumption:**
- If flight distance is available, use distance-based calculation
- Otherwise, fallback to price-based calculation
- Cabin class impacts miles earned (business/first earn more)

**Example:**
```javascript
// IST → JFK (8,000 km, Economy, $500)
miles = 8000 * 1.0 = 8,000 miles

// IST → JFK (8,000 km, Business, $1,500)
miles = 8000 * 1.5 = 12,000 miles
```

### Admin Domain Strategy

**Current Implementation:** Route-based with deployment flexibility

**Approach:**
- Single React app with `/admin/*` routes
- Role-based access control (ADMIN role required)
- Can be deployed as:
  1. **Single domain** (easier): `airlines.com/admin`
  2. **Separate domains** (more professional): `admin.airlines.com`

**Why Route-Based?**
- ✅ Simpler development (one codebase)
- ✅ Shared components and utilities
- ✅ Easier authentication flow
- ✅ Can still deploy separately if needed

**How to Deploy Separately:**

**Option 1: Single Build, Different Routes (Current)**
```bash
npm run build
# Deploy to airlines.com
# Both user and admin routes available
```

**Option 2: Two Separate Builds**
```bash
# Build user app (exclude admin routes)
VITE_BUILD_TYPE=user npm run build
# Deploy to airlines.com

# Build admin app (only admin routes)
VITE_BUILD_TYPE=admin npm run build
# Deploy to admin.airlines.com
```

**Nginx Configuration Example:**
```nginx
# User domain
server {
  server_name airlines.com;
  location / {
    # User build
  }
}

# Admin domain
server {
  server_name admin.airlines.com;
  location / {
    # Admin build
  }
}
```

**Security:**
- Gateway verifies ADMIN role via Keycloak JWT
- Admin routes protected on both frontend and backend
- Separate domain adds extra security layer (optional)

### Welcome Email Flow

**Complete Flow:**

1. **User Registers** (Frontend → Gateway)
   ```
   POST /api/v1/auth/register
   { username, email, password, firstName, lastName }
   ```

2. **Gateway Creates User** (Keycloak)
   - Creates user in Keycloak IAM
   - Assigns USER role
   - Gets user ID from response

3. **Gateway Publishes Event** (RabbitMQ)
   ```javascript
   // Queue: welcome-queue
   {
     userId: "uuid",
     email: "user@example.com",
     firstName: "John",
     lastName: "Doe",
     timestamp: "2024-01-14T10:00:00Z"
   }
   ```

4. **Notification Service Consumes** (Worker)
   - Listens to `welcome-queue`
   - Sends welcome email via SMTP
   - Logs success/failure

**Why This Architecture?**
- ✅ Decoupled: Gateway doesn't wait for email
- ✅ Resilient: Email failures don't block registration
- ✅ Scalable: Multiple notification workers
- ✅ Reliable: RabbitMQ ensures delivery

**Testing:**
```bash
# Check queue
docker exec airline-rabbitmq rabbitmqctl list_queues

# Check consumer logs
docker logs airline-notification-service -f
```

---
