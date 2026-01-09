# Digital Iskole Backend - Runbook

## Quick Start Guide

This runbook provides step-by-step instructions for setting up, running, and deploying the Digital Iskole backend API.

---

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: Package manager
- **Firebase Project**: With Firestore, Authentication, Storage, and Cloud Messaging enabled
- **Firebase Service Account Key**: JSON file with admin credentials

---

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in the following required variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

**Important Notes:**
- `FIREBASE_PRIVATE_KEY` must include the full private key with `\n` newlines
- `JWT_SECRET` should be a strong random string (use `openssl rand -base64 32` to generate)
- Never commit `.env` file to version control

### 1.3 Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the `private_key` value (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
6. Paste into `.env` as `FIREBASE_PRIVATE_KEY` (replace `\n` with actual newlines or use the format shown above)

---

## Step 2: Firebase Project Setup

### 2.1 Enable Firebase Services

Ensure the following services are enabled in your Firebase project:

- **Authentication**: Email/Password provider enabled
- **Firestore Database**: Created in production mode
- **Storage**: Created in production mode
- **Cloud Messaging**: API enabled

### 2.2 Initialize Firestore Collections

The following collections will be created automatically when data is inserted, but you can pre-create them:

- `users`
- `teachers`
- `students`
- `parents`
- `classes`
- `subjects`
- `attendance`
- `exams`
- `marks`
- `appointments`
- `notices`
- `notifications`
- `reports`
- `academicYears`
- `gradingSystem`
- `settings`
- `files`

### 2.3 Create Initial Admin User

Run the admin creation script:

```bash
npm run create-admin
```

Or manually:
1. Create a user in Firebase Authentication with email/password
2. Copy the User UID
3. Create a document in Firestore `users/{uid}` with:
```json
{
  "uid": "USER_UID",
  "email": "admin@digitaliskole.lk",
  "role": "admin",
  "profileId": "admin_001",
  "displayName": "System Administrator",
  "language": "en",
  "theme": "light",
  "fcmTokens": [],
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## Step 3: Run the Backend

### 3.1 Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`).

### 3.2 Production Mode

```bash
npm run build
npm start
```

### 3.3 Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T...",
  "uptime": 123.45
}
```

---

## Step 4: Connect Frontend

### 4.1 Update Frontend Environment Variables

In your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4.2 Test API Connection

The frontend should now be able to connect to the backend API. Test with:

```bash
# Login (replace with actual credentials)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitaliskole.lk","password":"your-password"}'
```

---

## Step 5: API Endpoints

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Authentication
All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <token>
```

### Available Endpoints

See `docs/frontend-api-map.md` for complete API documentation.

**Key Endpoints:**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

---

## Step 6: Implementation Status

### ✅ Completed
- Project structure and configuration
- Firebase Admin SDK setup
- Authentication module (login, logout, refresh, me)
- Middleware (auth, role, error, rate limiting, validation, upload)
- Route skeletons for all modules
- Response utilities and error handling
- Type definitions

### 🚧 To Be Implemented
The following modules have route placeholders and need full implementation:

1. **Users Management** (`/api/users/*`)
   - Teachers CRUD
   - Students CRUD
   - Parents CRUD

2. **Academic Management** (`/api/academic/*`)
   - Classes CRUD
   - Subjects CRUD

3. **Attendance** (`/api/attendance/*`)
   - Mark attendance
   - View attendance history
   - Attendance statistics

4. **Exams & Marks** (`/api/exams/*`, `/api/marks/*`)
   - Exam management
   - Marks entry
   - Exam paper uploads

5. **Appointments** (`/api/appointments/*`)
   - Create appointment requests
   - Approve/reject appointments

6. **Notices** (`/api/notices/*`)
   - Create notices
   - View notices

7. **Notifications** (`/api/notifications/*`)
   - List notifications
   - Mark as read
   - Push notifications (FCM)

8. **Reports** (`/api/reports/*`)
   - Generate PDF reports
   - Download reports

9. **Settings** (`/api/settings/*`)
   - Grading scale
   - Academic years
   - User preferences

10. **File Uploads** (`/api/upload/*`)
    - Profile pictures
    - Exam papers
    - Notice attachments

---

## Step 7: Implementation Pattern

Each module follows this pattern:

### 7.1 Service Layer (`src/services/`)
Business logic and Firebase operations:

```typescript
// Example: src/services/students.service.ts
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';

export class StudentsService {
  async getAll() {
    const snapshot = await db.collection(COLLECTIONS.STUDENTS).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async create(data: CreateStudentRequest) {
    // Validation, business logic, Firestore operations
  }
}
```

### 7.2 Controller Layer (`src/controllers/`)
Request/response handling:

```typescript
// Example: src/controllers/students.controller.ts
export class StudentsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await studentsService.getAll();
      sendSuccess(res, students);
    } catch (error) {
      next(error);
    }
  }
}
```

### 7.3 Routes (`src/routes/`)
Route definitions with middleware:

```typescript
// Example: src/routes/students.routes.ts
router.get('/', authenticateToken, requireAdmin, 
  studentsController.getAll.bind(studentsController));
```

### 7.4 Validators (`src/validators/`)
Input validation:

```typescript
// Example: src/validators/students.validator.ts
export const createStudentValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('admissionNumber').notEmpty().withMessage('Admission number is required'),
];
```

---

## Step 8: Testing

### 8.1 Run Tests

```bash
npm test
```

### 8.2 Test Coverage

```bash
npm run test:coverage
```

### 8.3 Manual Testing

Use tools like:
- **Postman**: API testing
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

---

## Step 9: Common Issues

### Issue: "Missing Firebase Admin SDK configuration"

**Solution**: Check that all Firebase environment variables are set in `.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

### Issue: "CORS errors"

**Solution**: Update `CORS_ORIGIN` in `.env` to match your frontend URL.

### Issue: "Token verification failed"

**Solution**: 
- Ensure Firebase Authentication is enabled
- Check that the token is being sent in the `Authorization: Bearer <token>` header
- Verify the token hasn't expired

### Issue: "Permission denied" in Firestore

**Solution**: 
- Check Firestore security rules
- Ensure the service account has proper permissions
- Verify the user document exists in the `users` collection

### Issue: "Port already in use"

**Solution**: 
- Change `PORT` in `.env`
- Or kill the process using the port: `lsof -ti:3001 | xargs kill`

---

## Step 10: Deployment

### 10.1 Build for Production

```bash
npm run build
```

### 10.2 Environment Variables

Set all environment variables in your hosting platform:
- Heroku: `heroku config:set KEY=value`
- Vercel: Add in project settings
- AWS: Use Parameter Store or Secrets Manager

### 10.3 Recommended Hosting

- **Vercel**: Easy deployment for Node.js
- **Heroku**: Simple PaaS
- **AWS EC2/Elastic Beanstalk**: More control
- **Google Cloud Run**: Serverless with Firebase integration

### 10.4 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS for production domain
- [ ] Set up logging (Winston logs to files)
- [ ] Enable HTTPS
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure rate limiting appropriately
- [ ] Set up backup for Firestore

---

## Step 11: Next Steps

1. **Implement Remaining Services**: Complete all service layer implementations
2. **Add Tests**: Write unit and integration tests
3. **Add Logging**: Enhance logging for production
4. **Add Monitoring**: Set up error tracking and performance monitoring
5. **Optimize Queries**: Add indexes for Firestore queries
6. **Add Caching**: Implement Redis caching for frequently accessed data
7. **Documentation**: Complete API documentation with Swagger/OpenAPI

---

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review Firebase Console for errors
3. Check `docs/frontend-api-map.md` for API contracts
4. Review `docs/Digital-Iskole-Backend-Documentation.md` for detailed specs

---

## License

ISC

---

**Last Updated**: January 2025


