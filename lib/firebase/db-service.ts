// ==========================================
// Firebase Firestore Database Service
// ==========================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type DocumentData,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"

// Generic get document by ID
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as T
}

// Generic get all documents with optional query constraints
export async function getDocuments<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as T[]
}

// Generic add document
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return docRef.id
}

// Generic update document
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>,
): Promise<void> {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  })
}

// Generic delete document
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

// Helper to convert Firestore Timestamps to Dates
function convertTimestamps(data: DocumentData): DocumentData {
  const converted: DocumentData = {}

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate()
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      converted[key] = convertTimestamps(value)
    } else {
      converted[key] = value
    }
  }

  return converted
}

// Re-export query helpers for convenience
export { where, orderBy, limit, startAfter }
