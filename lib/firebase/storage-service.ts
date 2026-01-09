// ==========================================
// Firebase Storage Service
// ==========================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./config"

// Upload file and return download URL
export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// Upload exam paper
export async function uploadExamPaper(studentId: string, examId: string, file: File): Promise<string> {
  const path = `exam-papers/${studentId}/${examId}/${file.name}`
  return uploadFile(path, file)
}

// Upload profile picture
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  const path = `profile-pictures/${userId}/${file.name}`
  return uploadFile(path, file)
}

// Upload report PDF
export async function uploadReport(userId: string, reportId: string, file: Blob): Promise<string> {
  const path = `reports/${userId}/${reportId}.pdf`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// Delete file
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

// Get download URL
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path)
  return getDownloadURL(storageRef)
}
