# FreshMart - Complete Local Setup & Run Guide

## 📋 Prerequisites
- **Node.js** v18+ & npm
- **PostgreSQL** v14+ (or Docker)
- **Redis** v6+ (or Docker)
- **Flutter SDK** v3.10+ & Dart
- **Android Studio** / **Xcode** (for mobile emulators)
- **Git**
- **Docker & Docker Compose** (optional, recommended for infrastructure)

---

## 🐳 Option 1: Docker Compose Setup (Infrastructure + Backend + Admin)

### Step 1: Create Root `docker-compose.yml`
Create a `docker-compose.yml` in your project root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: freshmart_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: freshmart
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - freshmart_net

  redis:
    image: redis:7-alpine
    container_name: freshmart_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - freshmart_net

  backend:
    build: ./backend
    container_name: freshmart_backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/freshmart?schema=public
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      CORS_ORIGIN: http://localhost:5173,http://localhost:3000
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis
    networks:
      - freshmart_net

  admin:
    build: ./admin_panel
    container_name: freshmart_admin
    restart: unless-stopped
    ports:
      - "5173:80"
    environment:
      VITE_API_BASE_URL: http://localhost:3000
    depends_on:
      - backend
    networks:
      - freshmart_net

volumes:
  pgdata:

networks:
  freshmart_net:
    driver: bridge
```

### Step 2: Create Backend `Dockerfile`
Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Step 3: Build & Start Containers
```bash
docker compose up -d --build
```
- PostgreSQL runs on `localhost:5432`
- Redis runs on `localhost:6379`
- Backend runs on `http://localhost:3000`
- Admin runs on `http://localhost:5173`

---

## 💻 Option 2: Native Local Setup

### Step 1: Start Dependencies
```bash
# Start PostgreSQL & Redis locally
# Ubuntu/Debian: sudo systemctl start postgresql redis-server
# macOS (Homebrew): brew services start postgresql redis
# Windows: Use native installers or Docker Desktop
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freshmart?schema=public"
JWT_SECRET="change-this-to-a-strong-random-string"
REDIS_HOST="localhost"
REDIS_PORT="6379"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```
```bash
npx prisma generate
npx prisma db push
npm run seed
npm run seed-admin
npm run start:dev
```

### Step 3: Admin Panel Setup
```bash
cd admin_panel
npm install
# Create .env file:
echo "VITE_API_BASE_URL=http://localhost:3000" > .env
npm run dev
```

### Step 4: Mobile App Setup
```bash
cd mobile_app
flutter pub get
```
Edit `lib/core/config/env.dart`:
- **Web:** Keep `http://localhost:3000`
- **Android Emulator:** Keep `http://10.0.2.2:3000`
- **Physical Device / iOS Simulator:** Replace with `http://<YOUR_PC_LOCAL_IP>:3000`
- **If Backend runs in Docker:** Replace with `http://host.docker.internal:3000` (Android emulator) or your host machine IP.
```bash
flutter run
```

---

## 🔑 Environment Configuration Summary

| Component | Required Env Vars | Notes |
|-----------|------------------|-------|
| **Backend** | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `REDIS_HOST` | Optional: `SMTP_*`, `RAZORPAY_*`, `CLOUDINARY_*`, `FIREBASE_SERVICE_ACCOUNT` |
| **Admin** | `VITE_API_BASE_URL` | Default fallback: `http://localhost:3000` |
| **Mobile** | `Env.baseUrl` in `env.dart` | Auto-switches for Web/Android. Change manually for physical devices. |

---

## 🗄️ Database & Admin Initialization

1. **Create Database:**
   ```bash
   createdb freshmart  # or via pgAdmin / DBeaver
   ```
2. **Sync Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Seed Data & Create Admin:**
   ```bash
   npm run seed          # Populates categories, subcategories, products, banners
   npm run seed-admin    # OR run: npx ts-node scripts/set-admin-role.ts
   ```
4. **Default Admin Credentials:**
   - **Email:** `admin@freshmart.com`
   - **Password:** `Admin@123`

---

## 🚀 Where & How to Run Each App

| Component | Run Command | Access URL | Notes |
|-----------|-------------|------------|-------|
| **PostgreSQL** | `docker compose up -d postgres` or native service | `localhost:5432` | Required for backend |
| **Redis** | `docker compose up -d redis` or native service | `localhost:6379` | Required for background jobs (BullMQ) |
| **Backend** | `npm run start:dev` (in `/backend`) | `http://localhost:3000` | API server. Health: `/health` |
| **Admin Panel** | `npm run dev` (in `/admin_panel`) | `http://localhost:5173` | Web UI for management |
| **Mobile App** | `flutter run` (in `/mobile_app`) | Emulator / Physical Device | Requires connected device/emulator |

---

## ✅ Verification Checklist

- [ ] PostgreSQL running & `freshmart` database exists
- [ ] Redis running (check with `redis-cli ping` → `PONG`)
- [ ] Backend running on `:3000` → `GET /health` returns `{"status":"ok"}`
- [ ] Admin panel running on `:5173` → Opens in browser, no CORS errors
- [ ] Login to Admin Panel with `admin@freshmart.com` / `Admin@123` → Redirects to Dashboard
- [ ] Mobile app compiles & launches → Home screen loads banners/categories
- [ ] Mobile login works → Cart/Checkout accessible
- [ ] If using Docker: `docker compose ps` shows all services `healthy`/`running`
- [ ] If using physical device: Mobile `baseUrl` matches your PC's LAN IP (e.g., `http://192.168.1.x:3000`)

---

## 🛑 Troubleshooting

| Issue | Solution |
|-------|----------|
| `CORS error` on Admin/Mobile | Ensure `CORS_ORIGIN` in backend `.env` includes your admin/mobile origin. Restart backend. |
| `Prisma connection error` | Verify `DATABASE_URL` matches running PostgreSQL credentials. Run `npx prisma db push`. |
| `Redis connection refused` | Ensure Redis is running. For Docker, use `REDIS_HOST=redis`. For native, `REDIS_HOST=localhost`. |
| Mobile shows network error | If backend runs on host, Android emulator needs `10.0.2.2`. Physical device needs your PC IP. Disable firewall temporarily for testing. |
| Admin shows `Vite` proxy error | Ensure `VITE_API_BASE_URL` matches running backend port. Clear browser cache & hard reload. |
| `ENOENT` or `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm cache clean --force` & `npm install`. |
