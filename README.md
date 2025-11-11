# Paisa Ads Backend API

A comprehensive advertising platform backend built with NestJS, TypeORM, and PostgreSQL. This API powers a multi-type ad listing platform supporting poster ads, line ads, and video ads with role-based access control, payment processing, and advanced reporting capabilities.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features](#features)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Paisa Ads is an advertising platform that allows users to create, manage, and publish various types of advertisements. The platform supports:

- **Poster Ads**: Image-based advertisements
- **Line Ads**: Text-based classified advertisements
- **Video Ads**: Video-based promotional content

The system includes comprehensive admin controls, payment tracking, category management, location-based filtering, and extensive reporting capabilities.

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL with TypeORM 0.3.x
- **Authentication**: JWT (JSON Web Tokens) + Passport
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **OTP Service**: Custom SMS integration
- **Password Hashing**: bcrypt

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=paisaads

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# SMS/OTP Configuration
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=your_sender_id

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://paisaads.in
```

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb paisaads
```

2. Run migrations to create database schema:
```bash
npm run migration:run
```

3. (Optional) Seed the database with sample data:
```bash
npm run seed
```

The seeder will populate:
- Sample users with different roles
- Category hierarchies
- Sample ads (poster, line, and video ads)

## Running the Application

### Development Mode
```bash
# Watch mode with hot reload
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The API will be available at `http://localhost:3001`

## API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: `http://localhost:3001/api`

The Swagger documentation provides:
- Complete API endpoint reference
- Request/response schemas
- Authentication requirements
- Interactive API testing

## Project Structure

```
backend/
├── src/
│   ├── ad-comments/          # Ad comments module
│   ├── ad-dashboard/         # Dashboard analytics
│   ├── ad-position/          # Ad positioning/placement
│   ├── auth/                 # Authentication & authorization
│   │   ├── decorator/        # Custom decorators (roles, public routes)
│   │   ├── guard/            # JWT guard
│   │   └── auth.service.ts   # Auth business logic
│   ├── category/             # Hierarchical category management
│   │   └── entities/         # Main, level 1, 2, 3 categories
│   ├── configurations/       # System configurations
│   ├── common/
│   │   └── enums/           # Shared enums (roles, ad status, etc.)
│   ├── db/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Database seeders
│   ├── image/               # Image upload & management
│   ├── line-ad/             # Line advertisement module
│   ├── otp/                 # OTP generation & verification
│   ├── payment/             # Payment processing & tracking
│   ├── poster-ad/           # Poster advertisement module
│   ├── reports/             # Comprehensive reporting module
│   ├── user/                # User & customer management
│   │   └── entities/        # User, customer, admin entities
│   ├── video-ad/            # Video advertisement module
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── .env                     # Environment variables
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```

## Features

### Core Features

1. **Multi-Type Ad Management**
   - Poster Ads (image-based)
   - Line Ads (text-based classifieds)
   - Video Ads (video content)
   - CRUD operations for all ad types
   - Status workflow: DRAFT → PENDING_REVIEW → APPROVED/REJECTED → PUBLISHED

2. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - OTP-based phone verification
   - Viewer login for public access
   - Password management

3. **Category Management**
   - 4-level hierarchical category system
   - Main Category → Category One → Category Two → Category Three
   - Color customization per category
   - Active/inactive status control

4. **Location-Based Filtering**
   - State and city-based ad filtering
   - Geographic targeting for ads

5. **Payment Management**
   - Payment tracking for ad postings
   - Payment status monitoring
   - Revenue reporting

6. **Advanced Search & Filtering**
   - Full-text search across ads
   - Filter by category, location, status
   - Date range filtering
   - Multi-criteria advanced filters

7. **Comprehensive Reporting**
   - Ad statistics by type and status
   - User registration reports
   - Admin activity tracking
   - Revenue analytics
   - Approval time analysis
   - Category-wise breakdowns

8. **Ad Comments**
   - User comments on advertisements
   - Comment moderation

9. **Image Management**
   - Multiple image uploads per ad
   - Image storage and retrieval

## User Roles

The system supports five distinct user roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| `SUPER_ADMIN` | Full system access | Complete CRUD operations, user management, system configuration |
| `EDITOR` | Content management | Ad approval/rejection, content editing |
| `REVIEWER` | Content review | Ad review and reporting access |
| `USER` | Regular customer | Create/manage own ads, view published content |
| `VIEWER` | Public visitor | View published ads only (phone-based access) |

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/login` - User login (email/phone + password)
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile
- `POST /auth/viewer-login` - Viewer login (phone only)
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/send-verification-otp` - Send account verification OTP
- `POST /auth/verify-account` - Verify account with OTP

### Users (`/users`)
- `GET /users` - List all users (Admin only)
- `POST /users` - Create user (Super Admin only)
- `POST /users/register-customer` - Public customer registration
- `GET /users/current` - Get current user info
- `GET /users/customer/me` - Get customer profile
- `GET /users/:id` - Get user by ID
- `GET /users/phone/:phone` - Find user by phone
- `PATCH /users/me` - Update own profile
- `PATCH /users/me/password` - Change password
- `POST /users/update-customer/:id` - Update customer info
- `PATCH /users/:id/deactivate` - Deactivate user
- `PATCH /users/:id/activate` - Activate user
- `DELETE /users/:id` - Delete user

### Poster Ads (`/poster-ad`)
- `GET /poster-ad/today` - Get today's poster ads (public)
- `POST /poster-ad` - Create poster ad (User role)
- `GET /poster-ad` - List all poster ads (with filters)
- `GET /poster-ad/status/:statuses` - Filter by status (Admin)
- `GET /poster-ad/my-ads` - User's own ads
- `GET /poster-ad/category/:categoryId` - Ads by category
- `GET /poster-ad/search` - Search ads
- `GET /poster-ad/:id` - Get single ad
- `PATCH /poster-ad/:id` - Update own ad (User)
- `PATCH /poster-ad/admin/:id` - Update ad (Admin)
- `DELETE /poster-ad/:id` - Delete ad

### Line Ads (`/line-ad`)
Similar structure to Poster Ads with line-specific endpoints

### Video Ads (`/video-ad`)
Similar structure to Poster Ads with video-specific endpoints

### Categories (`/categories`)
- `GET /categories/tree` - Get full category tree (public)
- `POST /categories/tree` - Create category tree (Super Admin)
- `POST /categories/main` - Create main category
- `POST /categories/main/:mainId/one` - Create level 1 category
- `POST /categories/one/:oneId/two` - Create level 2 category
- `POST /categories/two/:twoId/three` - Create level 3 category
- `GET /categories/main/:id` - Get main category
- `PATCH /categories/main/:id` - Update main category
- `PATCH /categories/one/:id` - Update level 1 category
- `PATCH /categories/two/:id` - Update level 2 category
- `PATCH /categories/three/:id` - Update level 3 category
- `DELETE /categories/*/:id` - Delete categories

### Reports (`/reports`)
- `GET /reports/ad-stats` - Ad statistics by type/status
- `GET /reports/filtered-ads` - Advanced filtered ads
- `GET /reports/filtered-stats` - Statistics for filtered ads
- `GET /reports/export` - Export ads data (CSV/Excel)
- `GET /reports/users/registrations` - User registration reports
- `GET /reports/users/active-vs-inactive` - Active vs inactive users
- `GET /reports/admin/activity` - Admin activity tracking
- `GET /reports/listings/analytics` - Listing analytics
- `GET /reports/payments/transactions` - Payment reports
- `GET /reports/payments/revenue-by-product` - Revenue by ad type
- `GET /reports/payments/revenue-by-category` - Revenue by category

### Payments (`/payment`)
- `POST /payment` - Create payment record
- `PATCH /payment/:id` - Update payment (Admin)

### Image Upload (`/image`)
- `POST /image/upload` - Upload image
- Image serving endpoints

### Ad Comments (`/ad-comments`)
- Comment CRUD operations for advertisements

### Configurations (`/configurations`)
- System configuration management

### Ad Dashboard (`/ad-dashboard`)
- Dashboard statistics and analytics

### Ad Position (`/ad-position`)
- Manage ad positioning/placement

## Database Migrations

### Generate a new migration
```bash
npm run migration:generate --name=MigrationName
```

### Run migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### Drop entire schema (CAUTION: Production use discouraged)
```bash
npm run schema:drop
```

## Testing

### Run unit tests
```bash
npm run test
```

### Run e2e tests
```bash
npm run test:e2e
```

### Test coverage
```bash
npm run test:cov
```

### Watch mode
```bash
npm run test:watch
```

## Development Guidelines

### Code Style
- Use ESLint and Prettier for code formatting
- Run `npm run lint` to check code quality
- Run `npm run format` to auto-format code

### Database Entities
- All entities are located in `src/*/entities/` directories
- Use TypeORM decorators for relationships
- Maintain proper cascade and eager loading configurations

### Controllers
- Use Swagger decorators (`@ApiTags`, `@ApiOperation`) for documentation
- Implement proper DTOs with validation decorators
- Use role guards (`@Roles()`) for authorization
- Use `@Public()` decorator for public endpoints

### Services
- Keep business logic in service layer
- Use repositories for database operations
- Implement proper error handling

### Guards & Decorators
- `@CurrentUser()` - Get authenticated user from request
- `@Public()` - Mark endpoint as publicly accessible
- `@Roles(...roles)` - Restrict endpoint to specific roles

## Deployment

### Build for production
```bash
npm run build
```

The compiled files will be in the `dist/` directory.

### Environment variables
Ensure all production environment variables are properly configured, especially:
- `NODE_ENV=production`
- Secure `JWT_SECRET`
- Production database credentials
- CORS allowed origins

### Process management
Consider using PM2 or similar process managers:
```bash
pm2 start dist/main.js --name paisaads-api
```

### CORS Configuration
Update CORS settings in `src/main.ts` based on your frontend domain.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Apache License 2.0

Copyright 2025 Mobifish

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## Version History

- **v0.0.1** - Initial release
  - Core ad management functionality
  - Authentication & authorization
  - Reporting system
  - Payment tracking
