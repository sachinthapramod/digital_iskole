// ==========================================
// Firebase Authentication Service
// ==========================================

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./config"
import type { User } from "../types"

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

  if (!userDoc.exists()) {
    throw new Error("User profile not found")
  }

  return { id: userDoc.id, ...userDoc.data() } as User
}

// Sign out
export async function logOut(): Promise<void> {
  await signOut(auth)
}

// Create new user (Admin only)
export async function createUser(
  email: string,
  password: string,
  userData: Omit<User, "id" | "createdAt" | "updatedAt">,
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  const newUser: Omit<User, "id"> = {
    ...userData,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await setDoc(doc(db, "users", userCredential.user.uid), newUser)

  return { id: userCredential.user.uid, ...newUser } as User
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

// Change password (requires current password)
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new Error("No user logged in")
  }

  // Re-authenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)

  // Update password
  await updatePassword(user, newPassword)
}

// Update user profile
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    ...data,
    updatedAt: new Date(),
  })
}

// Get current Firebase user
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser
}

// Get user profile from Firestore
export async function getUserProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", userId))
  if (!userDoc.exists()) return null
  return { id: userDoc.id, ...userDoc.data() } as User
}
