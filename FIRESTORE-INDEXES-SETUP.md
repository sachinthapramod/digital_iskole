# Firestore Indexes Setup Guide

## Required Indexes

The following Firestore composite indexes are required for optimal performance. The application will work without them (using fallback queries), but creating these indexes will significantly improve query performance.

### 1. Notifications Index

**Collection:** `notifications`  
**Fields:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Why:** Allows efficient querying of user notifications sorted by creation date.

**Create Link:** The error message provides a direct link. Click it or use the URL below:
```
https://console.firebase.google.com/v1/r/project/digital-iskole-a1fec/firestore/indexes?create_composite=Clpwcm9qZWN0cy9kaWdpdGFsLWlza29sZS1hMWZlYy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
```

### 2. Reports Index (Admin)

**Collection:** `reports`  
**Fields:**
- `createdAt` (Descending)

**Why:** Allows efficient querying of all reports sorted by creation date.

### 3. Reports Index (User)

**Collection:** `reports`  
**Fields:**
- `createdBy` (Ascending)
- `createdAt` (Descending)

**Why:** Allows efficient querying of user's reports sorted by creation date.

### 4. Attendance Index

**Collection:** `attendance`  
**Fields:**
- `className` (Ascending)
- `date` (Ascending)

**Why:** Allows efficient querying of attendance by class and date.

### 5. Marks Index

**Collection:** `marks`  
**Fields:**
- `studentId` (Ascending)
- `updatedAt` (Descending)

**Why:** Allows efficient querying of student marks sorted by most recent updates.

**Create Link:** The error message provides a direct link. Click it or use the URL from the error log.

---

## How to Create Indexes

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `digital-iskole-a1fec`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. For each index above:
   - Select the collection
   - Add fields in the specified order
   - Set sort order (Ascending/Descending)
   - Click **Create**

### Option 2: Using firestore.indexes.json

Create a file `firestore.indexes.json` in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "attendance",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "className",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "marks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "studentId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

---

## Current Status

✅ **Application works without indexes** - Fallback queries are implemented  
⚠️ **Performance is suboptimal** - Queries will be slower until indexes are created  
✅ **No errors** - The application handles missing indexes gracefully

---

## Index Build Time

After creating indexes, Firestore will build them in the background. This typically takes:
- **Small collections (< 10,000 documents):** 1-5 minutes
- **Medium collections (10,000-100,000 documents):** 5-15 minutes
- **Large collections (> 100,000 documents):** 15-60 minutes

You can monitor index build status in Firebase Console → Firestore → Indexes.

---

## Verification

Once indexes are built, you should see:
- ✅ No more "index required" warnings in backend logs
- ✅ Faster query performance
- ✅ No fallback query warnings

The application will automatically use the indexes once they're available.
