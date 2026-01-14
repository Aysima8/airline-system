Modern airline reservation system — developed with microservices architecture and containerized using Docker.

# ✈️ Airline System - Microservices Architecture

Modern airline reservation system — developed with microservices architecture and containerized using Docker.

## Architecture

### Diagram (recommended)

```mermaid
flowchart TB
  FE[Frontend<br/>(React + Vite)<br/>Port 80] --> GW[Gateway<br/>(Express.js)<br/>Port 3000]

  GW --> FS[Flight Service<br/>Port 3002]
  GW --> TS[Ticket Service<br/>Port 3003]

  FS --> ML[ML Price Service<br/>Port 5000]
  TS --> NS[Notification Service<br/>Port 3004]

  subgraph Infra[Infrastructure Services]
    DB[(PostgreSQL<br/>Port 5432)]
    RD[(Redis<br/>Port 6379)]
    MQ[(RabbitMQ<br/>Port 5672<br/>UI 15672)]
    KC[(Keycloak (IAM)<br/>Port 8080)]
  end

  FS --> DB
  TS --> DB
  TS --> RD
  TS --> MQ
  NS --> MQ
  GW --> KC
  FE --> KC

 Features
Services

API Gateway (Port 3000)

Single entry point

JWT authentication

Request routing

Rate limiting

Flight Service (Port 3002)

Flight creation/search

Capacity control

Redis cache

ML price integration

Ticket Service (Port 3003)

Ticket purchase

Miles & Smiles

Payment mock

Asynchronous processing via queue

Notification Service (Port 3004)

Email sending

RabbitMQ consumer

Scheduler (nightly jobs)

In-app notifications

ML Price Service (Port 5000)

FastAPI

Linear Regression

Dynamic pricing

Training with Clean_Dataset.csv

Frontend (Port 80)

React + Vite

React Router

Axios

Modern UI

Infrastructure

Keycloak: Identity and Access Management (IAM) — Authentication & Authorization

PostgreSQL: Database

Redis: Cache and session storage

RabbitMQ: Message broker

Docker: Containerization

Nginx: Frontend web server

🔐 Authentication (Keycloak IAM)

The project provides IAM (Identity and Access Management) using Keycloak.

Predefined Users
User	Password	Roles	Permissions
admin	admin123	ADMIN, USER	Add/edit flights + all USER permissions
user	user123	USER	Search flights, purchase tickets
service-account	service123	SERVICE	Access to other airlines APIs
Keycloak Admin Panel

URL: http://localhost:8080

Admin User: admin / admin

More details: KEYCLOAK_SETUP.md

📦 Installation
Requirements

Docker 20.10+

Docker Compose 2.0+

Quick Start
# 1. Clone the repository
git clone <repo-url>
cd airline-system

# 2. Create environment file
cp .env.example .env

# 3. Start with Docker Compose
docker compose up --build

# 4. Check services
docker compose ps

First-Time Run
# Build and start all services
docker compose up --build -d

# Follow logs
docker compose logs -f

# Watch logs for a specific service
docker compose logs -f flight-service

🔗 Access URLs
Service	URL	Description
Frontend	http://localhost
	React UI
Gateway	http://localhost:3000
	API Gateway
Keycloak IAM	http://localhost:8080
	IAM Admin Panel (admin/admin)
Flight Service	http://localhost:3002
	Flight service
Ticket Service	http://localhost:3003
	Ticket service
Notification	http://localhost:3004
	Notification service
ML Service	http://localhost:5000
	ML pricing service
PostgreSQL	localhost:5432	Database
Redis	localhost:6379	Cache
RabbitMQ UI	http://localhost:15672
	Queue management (guest/guest)
📝 API Documentation
Gateway Endpoints
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
GET    /api/flights/search      - Flight search
POST   /api/flights             - Add flight (Admin)
POST   /api/tickets/purchase    - Purchase ticket
GET    /api/tickets/user        - User tickets

ML Service Endpoints
GET    /health                  - Health check
POST   /predict                 - Price prediction
POST   /train                   - Model training
GET    /docs                    - Swagger UI

🛠️ Development
Local Development
# Start infrastructure services only
docker compose up postgres redis rabbitmq -d

# Run backend services locally
cd gateway && npm run dev
cd flight-service && npm run dev
cd ticket-service && npm run dev

# Run frontend locally
cd frontend && npm run dev

# Run ML service locally
cd ml-price-service/src && python api.py

Stopping Services
# Stop all services
docker compose down

# Remove volumes (warning: data loss!)
docker compose down -v

# Restart a specific service
docker compose restart flight-service

Log Monitoring
# All logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f gateway

🧪 Testing
# Health check for all services
curl http://localhost:3000/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:5000/health

# ML service test
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

📊 Monitoring
Container Status
# Container status
docker compose ps

# Resource usage
docker stats

# Enter container
docker exec -it airline-gateway sh

Database Access
# Connect to PostgreSQL
docker exec -it airline-postgres psql -U postgres -d airline_db

# Connect to Redis
docker exec -it airline-redis redis-cli

# RabbitMQ Management UI
# http://localhost:15672 (guest/guest)

🔧 Troubleshooting
Port Conflicts
# Check used ports
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Change Docker Compose ports
# Edit ports section in docker-compose.yml

Container Won’t Start
# Check logs
docker compose logs service-name

# Rebuild container
docker compose build --no-cache service-name
docker compose up service-name

Database Connection Error
# PostgreSQL health check
docker exec airline-postgres pg_isready -U postgres

# Check connection string
docker compose logs flight-service | grep "database"

📂 Project Structure
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
