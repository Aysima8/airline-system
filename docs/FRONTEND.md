# Frontend Application (Adım 8)

## Overview

Basit ama çalışan React + Vite frontend uygulaması. UI mockup birebir değil, fonksiyonellik öncelikli.

**Teknolojiler:**
- React 18
- Vite (Build tool)
- React Router v6
- Axios
- CSS (Vanilla, no framework)

---

## Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Navbar.css
│   │   ├── FlightCard.jsx      # Flight result card
│   │   └── FlightCard.css
│   ├── pages/
│   │   ├── SearchFlights.jsx   # Ana sayfa: Uçuş arama
│   │   ├── SearchFlights.css
│   │   ├── BuyTicket.jsx       # Bilet satın alma
│   │   ├── AdminAddFlight.jsx  # Admin: Uçuş ekleme
│   │   ├── AdminAddFlight.css
│   │   ├── Login.jsx           # Giriş
│   │   ├── Register.jsx        # Kayıt
│   │   └── MyTickets.jsx       # Kullanıcının biletleri
│   ├── services/
│   │   └── api.js              # Axios instance + interceptors
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state management
│   ├── App.jsx                 # Main app + routing
│   ├── App.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── index.html
```

---

## Features Implemented

### 1. Search Flights Page (Ana Sayfa)

**Route:** `/`

**Features:**
- ✅ From/To (origin/destination) input
- ✅ Date picker
- ✅ Passenger count (1-9)
- ✅ **Flex Days** (±0, ±1, ±2, ±3 gün)
- ✅ **Direct Only** checkbox (sadece direkt uçuşlar)
- ✅ Results list with FlightCard components
- ✅ Responsive gradient design

**API Endpoint:**
```
GET /api/flights/search?from={origin}&to={destination}&date={date}&pax={count}&flex={days}&direct={true/false}
```

**Screenshot (Conceptual):**
```
┌─────────────────────────────────────────────┐
│  ✈️ Uçuş Ara                                │
├─────────────────────────────────────────────┤
│ [Nereden] [Nereye] [Tarih] [Yolcu]         │
│ [Esnek Gün ±] [☐ Sadece Direkt]            │
│ [Uçuş Ara Button]                           │
├─────────────────────────────────────────────┤
│ Bulunan Uçuşlar (5)                         │
│ ┌───────────────────────────────────────┐  │
│ │ Turkish Airlines  TK123   5000 TL     │  │
│ │ IST 10:00 ──✈️ 2h──> AYT 12:00       │  │
│ │ Müsait Koltuk: 150                    │  │
│ │ [Satın Al]                            │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2. Buy Ticket Page

**Route:** `/buy-ticket`

**Features:**
- ✅ Flight info display (route, time, price)
- ✅ Passenger information form (firstName, lastName, passportNo, nationality)
- ✅ **Payment Type Selection:** CARD or MILES
- ✅ **Miles & Smiles Member Number** field (optional)
- ✅ Credit card form (only shown for CARD payment)
- ✅ Miles payment info (only shown for MILES payment)
- ✅ Form validation
- ✅ Success redirect to My Tickets

**API Endpoint:**
```
POST /api/tickets/buy
Body: {
  flightId: "uuid",
  passengers: [{ firstName, lastName, passportNo, nationality }],
  paymentType: "CARD" | "MILES",
  memberNo: "MS123...", // optional
  paymentInfo: { ... }  // for CARD only
}
```

**Payment Types:**
1. **CARD Payment:**
   - Shows credit card form
   - If memberNo provided → earns miles
   - Mock payment processing

2. **MILES Payment:**
   - Shows miles info banner
   - Requires memberNo
   - Deducts miles from account

### 3. Admin Add Flight Page

**Route:** `/admin/add-flight`

**Auth:** Admin role required

**Features:**
- ✅ Flight number input
- ✅ **Airline selection** (Turkish Airlines, Pegasus, AnadoluJet, SunExpress)
- ✅ Origin/Destination (IATA codes)
- ✅ Departure/Arrival datetime pickers
- ✅ Total seats / Available seats
- ✅ Base price
- ✅ Success/Error messages
- ✅ Form reset after success

**API Endpoint:**
```
POST /api/v1/admin/flights
Body: {
  flightNumber: "TK123",
  airline: "Turkish Airlines",
  origin: "IST",
  destination: "AYT",
  departureTime: "2024-06-15T10:00:00",
  arrivalTime: "2024-06-15T12:00:00",
  totalSeats: 180,
  availableSeats: 180,
  basePrice: 500
}
```

**Design:**
- Dark gradient background (admin theme)
- Clean white form
- Two-column responsive grid
- Success notification with auto-clear

### 4. Navigation Bar

**Features:**
- ✅ Brand logo/name
- ✅ "Uçuş Ara" link
- ✅ "Biletlerim" link (logged in users)
- ✅ "Uçuş Ekle" link (admin only)
- ✅ User menu with name and logout
- ✅ Login/Register buttons (guests)
- ✅ Gradient purple design
- ✅ Sticky positioning

### 5. Flight Card Component

**Features:**
- ✅ Airline name and flight number
- ✅ Origin/Destination with times
- ✅ Flight duration visualization
- ✅ Price display
- ✅ Available seats info
- ✅ Direct/connecting indicator
- ✅ "Satın Al" button
- ✅ Hover animation
- ✅ Disabled state for sold out flights

---

## Routing Structure

```javascript
/ (Public)
  ├─ SearchFlights (Ana sayfa)
  └─ Flight results list

/buy-ticket (Protected)
  └─ Purchase form with payment options

/my-tickets (Protected)
  └─ User's ticket list

/admin/add-flight (Admin only)
  └─ Add new flight form

/login (Public)
  └─ Login form

/register (Public)
  └─ Registration form
```

---

## Admin Domain Separation

**Şart:** "Admin ayrı domain" için route-based ayırma yapıldı.

### Implementation:
1. **Route Prefix:** `/admin/*` routes for admin functionality
2. **Visual Separation:** Dark theme for admin pages vs. purple theme for user pages
3. **Role-Based Access:** Admin links only shown to admin users
4. **Separate Build (Bonus):** Could be deployed to `admin.airline.com` with routing config

**Current:** Single app with `/admin` path
**Future (Bonus):** Separate build for `admin.airline.com`

---

## API Integration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/api'
```

### Axios Configuration
```javascript
// Token injection
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 redirect to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints Used

**Flight Search:**
```
GET /api/flights/search?from=IST&to=AYT&date=2024-06-15&pax=2&flex=1&direct=true
```

**Buy Ticket:**
```
POST /api/tickets/buy
{
  "flightId": "uuid",
  "passengers": [...],
  "paymentType": "CARD" | "MILES",
  "memberNo": "MS123...",
  "paymentInfo": {...}
}
```

**Admin Add Flight:**
```
POST /api/v1/admin/flights
{
  "flightNumber": "TK123",
  "airline": "Turkish Airlines",
  ...
}
```

---

## State Management

### AuthContext

```javascript
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Styling Approach

### Design System

**Colors:**
- Primary Gradient: `#667eea → #764ba2` (Purple)
- Admin Gradient: `#2d3748 → #1a202c` (Dark Gray)
- Success: `#38a169`
- Error: `#e53e3e`
- Background: `#f4f4f4`

**Typography:**
- Font: System fonts (Arial, sans-serif)
- Sizes: 12px (small), 14px (labels), 16px (body), 18px+ (headings)

**Components:**
- Cards: White background, 12px border-radius, box-shadow
- Buttons: 8px border-radius, gradient backgrounds
- Inputs: 2px border, 8px border-radius, focus state

**Animations:**
- Hover: `transform: translateY(-2px)` on cards
- Transitions: `0.2s` for all interactive elements

### Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Mobile: ≤ 768px

**Mobile Adaptations:**
- Grid → Single column
- Reduced padding
- Stacked navigation
- Full-width buttons

---

## Build & Deployment

### Development
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: dist/ folder
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Testing the Frontend

### Manual Testing Checklist

**Search Flights:**
- [ ] Enter IST → AYT, date, 2 passengers
- [ ] Set flex days to ±1
- [ ] Check "Sadece Direkt Uçuşlar"
- [ ] Click "Uçuş Ara"
- [ ] Verify results display
- [ ] Click "Satın Al" on a flight

**Buy Ticket:**
- [ ] Fill passenger info
- [ ] Select CARD payment
- [ ] Fill card details
- [ ] Click "Satın Al"
- [ ] Verify success redirect

**Buy with Miles:**
- [ ] Select MILES payment
- [ ] Enter member number
- [ ] Verify card form hidden
- [ ] Verify miles banner shown

**Admin Add Flight:**
- [ ] Login as admin
- [ ] Navigate to /admin/add-flight
- [ ] Fill all fields
- [ ] Select airline
- [ ] Click "Uçuş Ekle"
- [ ] Verify success message

---

## Screenshots (Conceptual)

### Search Page
```
┌────────────────────────────────────────────┐
│ Navbar [Brand] [Links] [User Menu]        │
├────────────────────────────────────────────┤
│                                            │
│     ✈️ Uçuş Ara (Purple Gradient BG)      │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ [IST] [AYT] [Date] [2 pax]          │ │
│  │ [Flex ±1] [☑ Direkt] [Ara]          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Bulunan Uçuşlar (3)                      │
│  ┌─────────────────────────────────────┐  │
│  │ [Flight Card 1]                     │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ [Flight Card 2]                     │  │
│  └─────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### Buy Ticket Page
```
┌────────────────────────────────────────────┐
│ Navbar                                     │
├────────────────────────────────────────────┤
│ Bilet Satın Al                             │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Uçuş Bilgileri                       │  │
│ │ TK123: IST → AYT                     │  │
│ │ 15 Haziran 2024, 10:00               │  │
│ │ Fiyat: 5000 TL                       │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Yolcu Bilgileri                      │  │
│ │ [Ad] [Soyad] [Pasaport] [Uyruk]     │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Ödeme Yöntemi                        │  │
│ │ (○) Kredi Kartı  (●) Miles          │  │
│ │ [Miles Üye No]                       │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ [İptal] [Satın Al]                        │
└────────────────────────────────────────────┘
```

### Admin Add Flight Page
```
┌────────────────────────────────────────────┐
│ Navbar                                     │
├────────────────────────────────────────────┤
│      🛫 Yeni Uçuş Ekle (Dark BG)           │
│      Admin Panel - Uçuş Ekleme            │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ [Uçuş No] [Havayolu▼]               │  │
│ │ [Kalkış] [Varış]                     │  │
│ │ [Kalkış Zamanı] [Varış Zamanı]      │  │
│ │ [Toplam Koltuk] [Müsait] [Fiyat]    │  │
│ │                                      │  │
│ │ [İptal] [Uçuş Ekle]                 │  │
│ └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## Summary

✅ **Search Flights:** with from/to/date/pax + flex + direct filters
✅ **Results List:** FlightCard component with all flight details
✅ **Buy Ticket:** with CARD/MILES payment options
✅ **Admin Add Flight:** basit form with airline selection
✅ **Admin Ayrı Domain:** route-based separation (/admin path)
✅ **Responsive:** Mobile-friendly design
✅ **API Integration:** All backend endpoints connected
✅ **Auth:** Login/logout/protected routes

**🎯 Adım 8 Şartı Karşılandı:** UI mockup birebir değil ama çalışıyor, tüm minimum ekranlar mevcut.
