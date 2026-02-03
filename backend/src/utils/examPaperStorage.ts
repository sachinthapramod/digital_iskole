import { storage } from '../config/firebase';
import logger from '../utils/logger';

const EXAM_PAPERS_PREFIX = 'exam-papers';
const SIGNED_URL_EXPIRY_DAYS = 7; // Firebase signed URL max is 7 days

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

/**
 * Upload exam paper to Firebase Storage and return a signed download URL.
 * Path: exam-papers/{studentId}/{examId}/{filename}
 */
export async function uploadExamPaper(
  studentId: string,
  examId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucket = storage.bucket();
  const safeName = safeFilename(filename);
  const filePath = `${EXAM_PAPERS_PREFIX}/${studentId}/${examId}/${safeName}`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    contentType,
    metadata: {
      contentType,
      contentDisposition: `inline; filename="${safeName}"`,
    },
  });

  const expires = new Date(Date.now() + SIGNED_URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires,
  });

  logger.info(`Exam paper uploaded: ${filePath}`);
  return signedUrl;
}
