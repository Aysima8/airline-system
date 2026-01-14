# API Versioning + Pagination (Adım 9)

## Overview

REST API versioning ve pagination desteği ile scalable, maintainable API mimarisi.

**Şartlar:**
- ✅ REST versionable (`/v1/...`)
- ✅ Pagination support (`page`, `pageSize`)
- ✅ Response metadata (`total`, `page`, `pageSize`, `totalPages`)

---

## API Versioning

### Version Structure

**Format:** `/api/v{version}/{resource}`

**Current Version:** `v1`

**Example Endpoints:**
```
/api/v1/flights
/api/v1/tickets
/api/v1/auth
/api/v1/miles
/api/v1/admin
```

### Gateway Configuration

**File:** `gateway/src/app.js`

```javascript
// API Version 1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/miles', milesRoutes);
app.use('/api/v1/admin', adminRoutes);

// Legacy routes (backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/miles', milesRoutes);
```

### Version Migration Strategy

**When to Create New Version:**
- Breaking changes to API contract
- Major schema changes
- Changed authentication method
- Removed endpoints

**Backward Compatibility:**
- Legacy `/api/*` routes still work
- Redirect to `/api/v1/*` internally
- No changes required for existing clients

**Future Versions:**
- `/api/v2/*` can coexist with `/api/v1/*`
- Version-specific controllers/services
- Gradual deprecation of old versions

---

## Pagination

### Query Parameters

**Standard Pagination Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `pageSize` | integer | 10 | Items per page |

**Example:**
```
GET /api/v1/flights?page=2&pageSize=20
GET /api/v1/tickets/user?page=1&pageSize=15
```

### Response Format

**All paginated endpoints return:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 2,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

**Pagination Metadata:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of items |
| `page` | integer | Current page number |
| `pageSize` | integer | Items per page |
| `totalPages` | integer | Total number of pages |

---

## Paginated Endpoints

### 1. GET /api/v1/flights

**List all flights with pagination**

**Request:**
```http
GET /api/v1/flights?page=1&pageSize=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "flightNumber": "TK123",
      "airline": "Turkish Airlines",
      "origin": "IST",
      "destination": "AYT",
      "departureTime": "2024-06-15T10:00:00Z",
      "arrivalTime": "2024-06-15T12:00:00Z",
      "totalSeats": 180,
      "availableSeats": 150,
      "basePrice": 500
    }
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "pageSize": 10,
    "totalPages": 25
  }
}
```

### 2. GET /api/v1/flights/search

**Search flights with flexible filters and pagination**

**Request:**
```http
GET /api/v1/flights/search?from=IST&to=AYT&date=2024-06-15&pax=2&flex=1&direct=true&page=1&pageSize=10
```

**Query Parameters:**

| Parameter | Required | Type | Default | Description |
|-----------|----------|------|---------|-------------|
| `from` | Yes | string | - | Origin airport (IATA) |
| `to` | Yes | string | - | Destination airport (IATA) |
| `date` | Yes | string | - | Departure date (YYYY-MM-DD) |
| `pax` | No | integer | 1 | Number of passengers |
| `flex` | No | integer | 0 | Flexible days (±0, ±1, ±2, ±3) |
| `direct` | No | boolean | false | Direct flights only |
| `page` | No | integer | 1 | Page number |
| `pageSize` | No | integer | 10 | Items per page |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "flightNumber": "TK123",
      "airline": "Turkish Airlines",
      "origin": "IST",
      "destination": "AYT",
      "departureTime": "2024-06-15T10:00:00Z",
      "arrivalTime": "2024-06-15T12:00:00Z",
      "duration": 2,
      "availableSeats": 150,
      "totalSeats": 180,
      "basePrice": 500,
      "calculatedPrice": 5500,
      "passengers": 2,
      "isDirect": true
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2,
    "returned": 10
  },
  "filters": {
    "origin": "IST",
    "destination": "AYT",
    "date": "2024-06-15",
    "passengers": 2,
    "flexibleDays": 1,
    "directOnly": true
  }
}
```

**Special Fields:**
- `returned`: Actual number of items returned (may be less than pageSize on last page)
- `filters`: Echo of applied filters for client reference

### 3. GET /api/v1/tickets/user

**Get user's tickets with pagination**

**Request:**
```http
GET /api/v1/tickets/user?page=1&pageSize=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "flightId": "uuid",
      "pnr": "ABC123",
      "passengers": [...],
      "totalPrice": 5000,
      "paymentType": "CARD",
      "status": "confirmed",
      "createdAt": "2024-06-10T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 35,
    "page": 1,
    "pageSize": 10,
    "totalPages": 4
  }
}
```

---

## Implementation Details

### Repository Layer (Sequelize)

**Pattern:**
```javascript
async findAll(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const { count, rows } = await Model.findAndCountAll({
    limit: parseInt(pageSize),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  return {
    items: rows,
    total: count
  };
}
```

**Key Sequelize Methods:**
- `findAndCountAll()`: Returns both count and rows
- `limit`: Maximum items to return
- `offset`: Number of items to skip
- `count`: Total matching records
- `rows`: Actual data records

### Service Layer

**Pattern:**
```javascript
async getItems(page = 1, pageSize = 10) {
  const result = await repository.findAll(page, pageSize);

  return {
    items: result.items,
    pagination: {
      total: result.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(result.total / pageSize)
    }
  };
}
```

**Responsibilities:**
- Parse pagination parameters
- Call repository with correct offset/limit
- Calculate totalPages
- Format pagination metadata

### Controller Layer

**Pattern:**
```javascript
async getItems(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await service.getItems(page, pageSize);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

**Responsibilities:**
- Extract query parameters
- Validate and parse integers
- Set defaults (page=1, pageSize=10)
- Format final response

---

## Pagination Best Practices

### 1. Default Page Size
- **Default:** 10 items
- **Max:** 100 items (prevent abuse)
- **Validation:** `pageSize = Math.min(parseInt(pageSize) || 10, 100)`

### 2. Page Number
- **1-indexed:** Pages start from 1, not 0
- **Default:** Page 1
- **Validation:** `page = Math.max(parseInt(page) || 1, 1)`

### 3. Empty Results
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "totalPages": 0
  }
}
```

### 4. Out of Range Page
- Request: `page=100` when only 5 pages exist
- Response: Return empty array with correct metadata
```json
{
  "data": [],
  "pagination": {
    "total": 50,
    "page": 100,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

### 5. Performance Considerations
- **Index:** Ensure pagination columns are indexed (e.g., `createdAt`)
- **Limit:** Always use LIMIT/OFFSET in database queries
- **Count:** Cache total count for frequently accessed endpoints
- **Cursor-based:** Consider for very large datasets (future enhancement)

---

## Version Comparison

### v1 vs Legacy (No Version)

| Feature | Legacy `/api/*` | v1 `/api/v1/*` |
|---------|----------------|----------------|
| Pagination | ❌ No | ✅ Yes |
| Metadata | ❌ No | ✅ Yes |
| Filtering | Limited | Enhanced |
| Response Format | Inconsistent | Standardized |
| Breaking Changes | Possible | Controlled |

### Migration Path

**For Frontend Clients:**
```javascript
// Old
const response = await api.get('/api/flights');
const flights = response.data.data; // all flights

// New (v1)
const response = await api.get('/api/v1/flights?page=1&pageSize=20');
const flights = response.data.data; // paginated
const { total, page, totalPages } = response.data.pagination;
```

---

## Testing Pagination

### Test Cases

#### 1. First Page
```bash
curl "http://localhost:3000/api/v1/flights?page=1&pageSize=5"
```

Expected:
- `pagination.page` = 1
- `data.length` ≤ 5
- `pagination.totalPages` calculated correctly

#### 2. Middle Page
```bash
curl "http://localhost:3000/api/v1/flights?page=3&pageSize=10"
```

Expected:
- `pagination.page` = 3
- Correct offset applied (skips first 20 items)

#### 3. Last Page
```bash
curl "http://localhost:3000/api/v1/flights?page=5&pageSize=10"
```

Expected:
- `data.length` may be < 10
- `pagination.page` = 5
- `pagination.totalPages` = 5

#### 4. Empty Result
```bash
curl "http://localhost:3000/api/v1/flights?page=100&pageSize=10"
```

Expected:
- `data` = []
- `pagination.total` = actual total
- `pagination.page` = 100

#### 5. Default Parameters
```bash
curl "http://localhost:3000/api/v1/flights"
```

Expected:
- Uses defaults: page=1, pageSize=10

---

## Error Handling

### Invalid Page Number
```http
GET /api/v1/flights?page=abc
```

Response: Uses default `page=1`

### Invalid Page Size
```http
GET /api/v1/flights?pageSize=xyz
```

Response: Uses default `pageSize=10`

### Negative Values
```http
GET /api/v1/flights?page=-1&pageSize=-5
```

Response: Uses defaults (page=1, pageSize=10)

### Very Large Page Size
```http
GET /api/v1/flights?pageSize=10000
```

Response: Capped at max (e.g., 100)

---

## Future Enhancements

### 1. Cursor-Based Pagination
For very large datasets:
```
GET /api/v1/flights?cursor=eyJpZCI6MTIzfQ==&limit=20
```

### 2. HATEOAS Links
```json
{
  "data": [...],
  "pagination": {...},
  "links": {
    "self": "/api/v1/flights?page=2",
    "first": "/api/v1/flights?page=1",
    "prev": "/api/v1/flights?page=1",
    "next": "/api/v1/flights?page=3",
    "last": "/api/v1/flights?page=10"
  }
}
```

### 3. Range Headers (HTTP 206)
```http
GET /api/v1/flights
Range: items=0-19

HTTP/1.1 206 Partial Content
Content-Range: items 0-19/250
```

### 4. API Version Header
Alternative to URL versioning:
```http
GET /api/flights
Accept-Version: v1
```

---

## Summary

✅ **API Versioning:** `/api/v1/*` structure implemented
✅ **Pagination:** All list endpoints support `page` and `pageSize`
✅ **Metadata:** Consistent `pagination` object in all responses
✅ **Fields:** `total`, `page`, `pageSize`, `totalPages`
✅ **Backward Compatibility:** Legacy routes still work
✅ **Performance:** Efficient database queries with LIMIT/OFFSET
✅ **Scalability:** Ready for v2 and future versions

**Endpoints with Pagination:**
- `GET /api/v1/flights` (all flights)
- `GET /api/v1/flights/search` (search with filters)
- `GET /api/v1/tickets/user` (user tickets)

**🎯 Adım 9 Şartı Karşılandı:** REST versionable + complete pagination support
