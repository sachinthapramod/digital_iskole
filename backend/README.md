# Digital Iskole Backend API

Backend API server for the Digital Iskole School Management System.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

3. **Create admin user:**
   ```bash
   npm run create-admin
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001/api`

## Documentation

- **Setup Guide**: See [RUNBOOK.md](./RUNBOOK.md) for detailed setup instructions
- **API Contract**: See [../docs/frontend-api-map.md](../docs/frontend-api-map.md) for complete API documentation
- **Backend Specs**: See [../docs/Digital-Iskole-Backend-Documentation.md](../docs/Digital-Iskole-Backend-Documentation.md)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Firebase and app configuration
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── validators/      # Input validation
│   ├── utils/          # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── scripts/             # Utility scripts
├── tests/              # Test files
└── RUNBOOK.md          # Setup and deployment guide
```

## Technology Stack

- **Node.js 18+** - Runtime
- **Express 4.x** - Web framework
- **TypeScript** - Type safety
- **Firebase Admin SDK** - Backend Firebase services
- **JWT** - Token-based authentication
- **Winston** - Logging
- **Jest** - Testing

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run create-admin` - Create initial admin user
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Endpoints

All endpoints are prefixed with `/api` (configurable via `API_BASE_URL`).

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### Other Modules
See [frontend-api-map.md](../docs/frontend-api-map.md) for complete endpoint list.

## Authentication

The API uses JWT tokens for authentication. After login, include the token in requests:

```
Authorization: Bearer <token>
```

## Rate Limiting

- **Authentication**: 5 requests per 15 minutes
- **General API**: 100 requests per minute
- **File Upload**: 10 requests per minute
- **Report Generation**: 5 requests per 5 minutes

## Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  },
  "timestamp": "2025-01-07T..."
}
```

## Response Format

Success responses:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2025-01-07T..."
}
```

Paginated responses:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "timestamp": "2025-01-07T..."
}
```

## Implementation Status

✅ **Completed:**
- Project structure and configuration
- Firebase Admin SDK integration
- Authentication module
- Middleware (auth, role, error, rate limiting, validation, upload)
- Route skeletons for all modules
- Type definitions and utilities

🚧 **To Be Implemented:**
- Users management services
- Academic management services
- Attendance services
- Exams & marks services
- Appointments services
- Notices services
- Notifications services (with FCM)
- Reports services (with PDF generation)
- Settings services
- File upload services

## Development

### Adding a New Endpoint

1. **Create/Update Service** (`src/services/`)
   ```typescript
   export class MyService {
     async myMethod() {
       // Business logic
     }
   }
   ```

2. **Create/Update Controller** (`src/controllers/`)
   ```typescript
   export class MyController {
     async myHandler(req, res, next) {
       try {
         const result = await myService.myMethod();
         sendSuccess(res, result);
       } catch (error) {
         next(error);
       }
     }
   }
   ```

3. **Create/Update Validator** (`src/validators/`)
   ```typescript
   export const myValidator = [
     body('field').notEmpty().withMessage('Required'),
   ];
   ```

4. **Add Route** (`src/routes/`)
   ```typescript
   router.post('/my-endpoint',
     authenticateToken,
     validate(myValidator),
     myController.myHandler.bind(myController)
   );
   ```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment

See [RUNBOOK.md](./RUNBOOK.md) for detailed deployment instructions.

## License

ISC


