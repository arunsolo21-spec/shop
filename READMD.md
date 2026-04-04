```markdown
# FreshMart - Grocery Delivery System

A complete grocery delivery platform with a mobile app for customers, admin panel for management, and a robust backend API.

## 📱 Project Structure

```
grocery_system/
├── backend/           # NestJS Backend API
├── mobile_app/        # Flutter Mobile Application
├── admin_panel/       # React Admin Dashboard
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Payment**: Razorpay Integration
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **Container**: Docker

### Mobile App
- **Framework**: Flutter
- **State Management**: Riverpod
- **Local Storage**: Hive, Flutter Secure Storage
- **HTTP Client**: Dio
- **Navigation**: GoRouter

### Admin Panel
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with Glass Morphism Design
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **PostgreSQL** (v14 or higher)
- **Docker** and **Docker Compose** (optional)
- **Flutter SDK** (v3.10 or higher)
- **Git**

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 5GB free space

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grocery_system
```

### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backend
```

#### Install Dependencies

```bash
npm install
# or
pnpm install
```

#### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freshmart?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="FreshMart <noreply@freshmart.com>"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
RAZORPAY_WEBHOOK_SECRET="xxxxx"

# CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:8080"

# File Upload
FILE_UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE=5242880

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Firebase (Optional for Push Notifications)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project"}'

# Redis (Optional for Caching)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"

# Allowed Origins
ALLOWED_ORIGIN="http://localhost:5173,http://localhost:3000"

# Webhook Security
WEBHOOK_ALLOWED_IPS="127.0.0.1,::1"
```

#### Database Setup

1. **Create PostgreSQL Database**:

```bash
# Using psql
psql -U postgres
CREATE DATABASE freshmart;
\q
```

2. **Run Prisma Migrations**:

```bash
npx prisma migrate dev
npx prisma generate
```

3. **Seed Database (Optional)**:

```bash
npm run seed
```

4. **Create Admin User**:

```bash
npm run seed-admin
```

#### Start Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Using Docker
docker-compose up -d
```

The backend will run on `http://localhost:3000`

### 3. Mobile App Setup

#### Navigate to Mobile App Directory

```bash
cd ../mobile_app
```

#### Install Dependencies

```bash
flutter pub get
```

#### Environment Configuration

The mobile app uses compile-time constants. Update `lib/core/config/env.dart`:

```dart
class Env {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android Emulator
  // For iOS Simulator use: http://localhost:3000
  // For Physical Device use: http://YOUR_IP:3000
  
  static const String razorpayKeyId = 'rzp_test_xxxxx';
  static const String merchantId = 'freshmart';
  static const String merchantName = 'FreshMart Grocery';
  
  // Other configurations...
}
```

#### Run Mobile App

```bash
# For Android
flutter run --dart-define=BASE_URL=http://10.0.2.2:3000

# For iOS
flutter run --dart-define=BASE_URL=http://localhost:3000

# For Physical Android Device
flutter run --dart-define=BASE_URL=http://YOUR_IP:3000

# For Physical iOS Device
flutter run --dart-define=BASE_URL=http://YOUR_IP:3000

# Release Build
flutter build apk --release --dart-define=BASE_URL=http://YOUR_IP:3000
flutter build ios --release --dart-define=BASE_URL=http://YOUR_IP:3000
```

#### Platform-Specific Setup

**Android**:
- Update `android/app/src/main/AndroidManifest.xml` with internet permissions
- Configure keystore for production builds

**iOS**:
- Update `ios/Runner/Info.plist` with App Transport Security settings
- Configure signing and capabilities in Xcode

### 4. Admin Panel Setup

#### Navigate to Admin Panel Directory

```bash
cd ../admin_panel
```

#### Install Dependencies

```bash
npm install
# or
pnpm install
```

#### Environment Configuration

Create a `.env` file in the admin panel directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=FreshMart Admin
VITE_APP_VERSION=1.0.0
```

#### Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The admin panel will run on `http://localhost:5173`

#### Build for Production

```bash
npm run build
# or
pnpm build
```

The production build will be in the `dist/` folder.

## 🔧 Configuration

### Database Configuration

The application uses PostgreSQL. Ensure your database is running and accessible.

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Create database user
sudo -u postgres createuser -P freshmart_user

# Create database
sudo -u postgres createdb -O freshmart_user freshmart
```

### Payment Gateway Setup

1. Sign up at [Razorpay](https://razorpay.com)
2. Get your API keys from the dashboard
3. Update `.env` file with your keys
4. For testing, use Razorpay test mode

### Email Configuration

For Gmail:
1. Enable 2FA on your Google account
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### Cloudinary Setup (Optional)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your API credentials
3. Update `.env` file

## 📱 Running the Application

### Development Workflow

1. **Start Backend**:
```bash
cd backend
npm run start:dev
```

2. **Start Admin Panel**:
```bash
cd admin_panel
npm run dev
```

3. **Start Mobile App**:
```bash
cd mobile_app
flutter run --dart-define=BASE_URL=http://10.0.2.2:3000
```

### Using Docker

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:cov
```

### Mobile App Tests

```bash
cd mobile_app

# Run tests
flutter test

# Run with coverage
flutter test --coverage
```

## 📚 API Documentation

The backend API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api` (if configured)
- **Health Check**: `http://localhost:3000/health`

### Key Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Products**: `/products/*`
- **Orders**: `/orders/*`
- **Payments**: `/payments/*`
- **Categories**: `/categories/*`
- **Banners**: `/banners/*`

## 🔐 Default Credentials

### Admin Panel
- **Email**: admin@freshmart.com
- **Password**: Admin@123

### Test User
- **Email**: user@freshmart.com
- **Password**: User@123

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
# Ensure database exists
```

**2. Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

**3. Flutter Build Errors**
```bash
# Clean Flutter build
flutter clean
flutter pub get

# Rebuild
flutter build apk
```

**4. npm/pnpm Install Issues**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**5. CORS Errors**
- Ensure `CORS_ORIGIN` in backend `.env` includes your frontend URL
- Check browser console for specific CORS errors

## 📦 Deployment

### Backend Deployment

**Using Docker**:
```bash
docker build -t freshmart-backend .
docker run -p 3000:3000 --env-file .env freshmart-backend
```

**Using PM2**:
```bash
npm install -g pm2
pm2 start dist/main.js --name freshmart-backend
pm2 save
pm2 startup
```

### Mobile App Deployment

**Android**:
```bash
flutter build apk --release
flutter build appbundle --release
```

**iOS**:
```bash
flutter build ios --release
```

### Admin Panel Deployment

```bash
npm run build
# Deploy dist/ folder to your web server
```

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- HTTPS in production
- Environment variables for sensitive data
- Input validation and sanitization
- CORS configuration
- Rate limiting

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@freshmart.com

## 🙏 Acknowledgments

- NestJS Team
- Flutter Team
- React Team
- All open-source contributors

---

**Built with ❤️ by the FreshMart Team**
```