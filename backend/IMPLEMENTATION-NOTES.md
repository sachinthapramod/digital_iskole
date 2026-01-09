# Implementation Notes

## Authentication Flow

### Current Implementation

The authentication service has a limitation: **Firebase Admin SDK cannot directly verify passwords**.

### Recommended Approach

**Option 1: Frontend handles Firebase Auth, backend verifies tokens**

1. Frontend uses Firebase Auth SDK to sign in:
   ```typescript
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
   const idToken = await userCredential.user.getIdToken();
   ```

2. Frontend sends ID token to backend `/api/auth/login`:
   ```typescript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${idToken}` }
   });
   ```

3. Backend verifies the ID token and returns JWT tokens.

**Option 2: Use Firebase Auth REST API**

Modify `auth.service.ts` to use Firebase Auth REST API for password verification:

```typescript
import axios from 'axios';

async login(email: string, password: string): Promise<LoginResult> {
  // Use Firebase Auth REST API
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
    { email, password, returnSecureToken: true }
  );
  
  const idToken = response.data.idToken;
  // Verify token and proceed...
}
```

**Option 3: Custom password verification**

Store password hashes in Firestore and use bcrypt to verify (not recommended, Firebase Auth is better).

### Current Status

The current implementation assumes Option 1. Update the frontend to send Firebase ID tokens, or implement Option 2.

---

## Service Implementation Pattern

Each service should follow this pattern:

```typescript
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';

export class MyService {
  async getAll(filters?: any) {
    let query = db.collection(COLLECTIONS.MY_COLLECTION);
    
    // Apply filters
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  
  async getById(id: string) {
    const doc = await db.collection(COLLECTIONS.MY_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      throw new ApiErrorResponse('RESOURCE_NOT_FOUND', 'Resource not found', 404);
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  async create(data: CreateRequest) {
    // Validation
    // Business logic
    // Create in Firestore
    const docRef = await db.collection(COLLECTIONS.MY_COLLECTION).add({
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  }
  
  async update(id: string, data: UpdateRequest) {
    const docRef = db.collection(COLLECTIONS.MY_COLLECTION).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new ApiErrorResponse('RESOURCE_NOT_FOUND', 'Resource not found', 404);
    }
    
    await docRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });
  }
  
  async delete(id: string) {
    const docRef = db.collection(COLLECTIONS.MY_COLLECTION).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new ApiErrorResponse('RESOURCE_NOT_FOUND', 'Resource not found', 404);
    }
    
    await docRef.delete();
  }
}
```

---

## Data Access Control

### Role-Based Access

Implement data filtering based on user role:

```typescript
// In service methods
async getStudents(user: AuthenticatedUser) {
  let query = db.collection(COLLECTIONS.STUDENTS);
  
  if (user.role === 'teacher') {
    // Teachers can only see their assigned class students
    query = query.where('classId', '==', user.assignedClass);
  } else if (user.role === 'parent') {
    // Parents can only see their children
    query = query.where('parentId', '==', user.profileId);
  }
  // Admin can see all
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## Firestore Queries

### Best Practices

1. **Use indexes**: Create composite indexes for queries with multiple `where` clauses
2. **Limit results**: Always use `.limit()` for list queries
3. **Pagination**: Use `startAfter()` for cursor-based pagination
4. **Transactions**: Use transactions for multi-document operations

### Example: Paginated Query

```typescript
async getAll(page: number, limit: number, lastDoc?: any) {
  let query = db.collection(COLLECTIONS.MY_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit);
  
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  const snapshot = await query.get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    data,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === limit,
  };
}
```

---

## File Uploads

### Firebase Storage Pattern

```typescript
import { storage } from '../config/firebase';
import { STORAGE_PATHS } from '../config/constants';

async uploadFile(file: Express.Multer.File, userId: string, type: string) {
  const bucket = storage.bucket();
  const fileName = `${STORAGE_PATHS.PROFILES}/${userId}/${Date.now()}-${file.originalname}`;
  const fileRef = bucket.file(fileName);
  
  // Upload file
  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });
  
  // Make file publicly accessible (or use signed URLs)
  await fileRef.makePublic();
  
  const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
  // Save file metadata to Firestore
  await db.collection(COLLECTIONS.FILES).add({
    name: fileName,
    originalName: file.originalname,
    url,
    type,
    size: file.size,
    uploadedBy: userId,
    createdAt: Timestamp.now(),
  });
  
  return url;
}
```

---

## Notifications with FCM

### Sending Push Notifications

```typescript
import { messaging } from '../config/firebase';

async sendNotification(userId: string, title: string, message: string, data?: any) {
  // Get user's FCM tokens
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  const fcmTokens = userDoc.data()?.fcmTokens || [];
  
  if (fcmTokens.length === 0) {
    return; // No tokens to send to
  }
  
  // Send to all tokens
  const messages = fcmTokens.map(token => ({
    token,
    notification: { title, body: message },
    data: data || {},
  }));
  
  await messaging.sendEach(messages);
  
  // Save notification to Firestore
  await db.collection(COLLECTIONS.NOTIFICATIONS).add({
    userId,
    type: 'system',
    title,
    message,
    isRead: false,
    createdAt: Timestamp.now(),
  });
}
```

---

## PDF Report Generation

### Using Puppeteer

```typescript
import puppeteer from 'puppeteer';

async generatePDF(html: string, filename: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  
  await browser.close();
  
  // Upload to Firebase Storage
  const bucket = storage.bucket();
  const fileRef = bucket.file(`reports/${filename}`);
  await fileRef.save(pdf, { contentType: 'application/pdf' });
  
  const url = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-09-2491', // Far future
  });
  
  return url[0];
}
```

---

## Testing Strategy

### Unit Tests

Test services in isolation:

```typescript
import { StudentsService } from '../services/students.service';

describe('StudentsService', () => {
  it('should get all students', async () => {
    const service = new StudentsService();
    const students = await service.getAll();
    expect(students).toBeInstanceOf(Array);
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
import request from 'supertest';
import app from '../app';

describe('GET /api/students', () => {
  it('should return 401 without token', async () => {
    const response = await request(app).get('/api/students');
    expect(response.status).toBe(401);
  });
});
```

---

## Performance Optimization

1. **Batch Operations**: Use Firestore batch writes for multiple operations
2. **Caching**: Cache frequently accessed data (Redis recommended)
3. **Indexes**: Create Firestore indexes for all query patterns
4. **Pagination**: Always paginate large result sets
5. **Field Selection**: Use `.select()` to limit returned fields

---

## Security Considerations

1. **Input Validation**: Always validate and sanitize inputs
2. **Role Checks**: Verify user roles in middleware and services
3. **Data Isolation**: Filter data based on user role
4. **Rate Limiting**: Already implemented in middleware
5. **HTTPS**: Always use HTTPS in production
6. **Secrets**: Never commit secrets to version control

---

## Next Steps

1. Implement all service layers following the patterns above
2. Add comprehensive error handling
3. Write unit and integration tests
4. Set up CI/CD pipeline
5. Add monitoring and logging
6. Optimize Firestore queries and indexes
7. Add caching layer (Redis)
8. Complete API documentation (Swagger/OpenAPI)


