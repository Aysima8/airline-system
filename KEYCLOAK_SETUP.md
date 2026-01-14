# 🔐 Keycloak IAM Setup

## Keycloak Nedir?

Keycloak, modern uygulama ve servisler için açık kaynaklı bir Identity and Access Management (IAM) çözümüdür. Bu projede authentication ve authorization için Keycloak kullanılmaktadır.

## Önceden Tanımlı Kullanıcılar

Sistem başlatıldığında aşağıdaki kullanıcılar otomatik olarak oluşturulur:

### Admin Kullanıcı
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: admin@airline.com
- **Roller**: ADMIN, USER
- **Yetkiler**:
  - Uçuş ekleme/güncelleme/silme
  - Tüm USER yetkilerine sahip

### Normal Kullanıcı
- **Username**: `user`
- **Password**: `user123`
- **Email**: user@airline.com
- **Roller**: USER
- **Yetkiler**:
  - Uçuş arama
  - Bilet satın alma
  - Miles & Smiles işlemleri

### Servis Hesabı (Other Airlines)
- **Username**: `service-account`
- **Password**: `service123`
- **Email**: service@airline.com
- **Roller**: SERVICE
- **Yetkiler**:
  - Diğer havayollarının Miles ekleme API'sine erişim

## Keycloak Admin Panel

- **URL**: http://localhost:8080
- **Admin Username**: `admin`
- **Admin Password**: `admin`

Admin panel'den:
- Yeni kullanıcılar ekleyebilirsiniz
- Rolleri yönetebilirsiniz
- Token ayarlarını yapılandırabilirsiniz
- Client ayarlarını değiştirebilirsiniz

## API Kullanımı

### 1. Login (Token Alma)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "expiresIn": 1800,
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "username": "admin",
      "email": "admin@airline.com",
      "name": "admin",
      "roles": ["ADMIN", "USER"]
    }
  }
}
```

### 2. Register (Yeni Kullanıcı)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@airline.com",
    "password": "newpassword123",
    "firstName": "New",
    "lastName": "User"
  }'
```

### 3. Authenticated İstek (Admin - Uçuş Ekleme)

```bash
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI..."

curl -X POST http://localhost:3000/api/flights \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightNumber": "TK1234",
    "origin": "IST",
    "destination": "AYT",
    "departureTime": "2024-06-15T10:00:00Z",
    "arrivalTime": "2024-06-15T11:30:00Z",
    "totalSeats": 180,
    "availableSeats": 180,
    "basePrice": 500
  }'
```

### 4. Token Yenileme

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }'
```

## Roller ve Yetkiler

### USER Rolü
- ✅ Uçuş arama
- ✅ Bilet satın alma
- ✅ Kendi biletlerini görüntüleme
- ✅ Miles & Smiles üyelik işlemleri
- ❌ Uçuş ekleme/düzenleme

### ADMIN Rolü
- ✅ Tüm USER yetkileri
- ✅ Uçuş ekleme
- ✅ Uçuş güncelleme
- ✅ Uçuş silme
- ✅ Admin paneline erişim

### SERVICE Rolü
- ✅ Other airlines için Miles ekleme API'si
- ✅ Service-to-service authenticated çağrılar
- ❌ Kullanıcı işlemleri

## Frontend Entegrasyonu

Frontend'de token'ı localStorage'da saklayın:

```javascript
// Login sonrası
const response = await axios.post('/api/auth/login', { username, password });
localStorage.setItem('token', response.data.data.token);
localStorage.setItem('user', JSON.stringify(response.data.data.user));

// Her istekte
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## Troubleshooting

### Keycloak başlamıyor
```bash
# Logs kontrol et
docker logs airline-keycloak

# Keycloak'ı yeniden başlat
docker compose restart keycloak
```

### Token geçersiz hatası
```bash
# Refresh token ile yeni token al
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Admin paneline erişilemiyor
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`
- Realm: `airline` seçili olmalı

## Production Notları

⚠️ **Önemli**: Production'da aşağıdakileri mutlaka değiştirin:

1. **Client Secrets**:
   - `airline-gateway-secret-2024` → güçlü bir secret
   - `airline-service-secret-2024` → güçlü bir secret

2. **Default Passwords**:
   - Admin: `admin123` → güçlü şifre
   - User: `user123` → güçlü şifre
   - Service: `service123` → güçlü şifre

3. **Keycloak Admin Password**:
   - `admin` → güçlü şifre

4. **Token Süreleri**:
   - Access token: 30 dakika (default)
   - Refresh token: 30 gün (default)

5. **HTTPS Kullanın**:
   - Production'da mutlaka HTTPS
   - Keycloak SSL sertifikası yapılandırın

## Realm Export/Import

Mevcut realm configuration:
- Dosya: `keycloak/realm-export.json`
- Otomatik import edilir container başlatıldığında

Yeni export almak için:
```bash
docker exec -it airline-keycloak \
  /opt/keycloak/bin/kc.sh export \
  --dir /tmp \
  --realm airline
```
