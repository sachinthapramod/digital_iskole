import { storage } from '../config/firebase';
import logger from './logger';

const REPORTS_PREFIX = 'reports';
const SIGNED_URL_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/** Normalize filename for storage path (same logic for upload and lookup). */
export function reportPdfSafeName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

/**
 * Get a signed download URL for an existing report PDF in Storage (no Puppeteer).
 * Returns null if the file does not exist. Use this for cached PDFs to avoid 503 on Vercel.
 */
export async function getSignedUrlForExistingReport(
  reportId: string,
  storedFilename: string
): Promise<string | null> {
  const bucket = storage.bucket();
  const filePath = `${REPORTS_PREFIX}/${reportId}/${storedFilename}`;
  const file = bucket.file(filePath);

  const [exists] = await file.exists().catch(() => [false]);
  if (!exists) return null;

  const expires = new Date(Date.now() + SIGNED_URL_EXPIRY_MS);
  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires });
  return signedUrl;
}

/**
 * Upload report PDF to Firebase Storage and return a signed download URL.
 * Path: reports/{reportId}/{filename}
 * Returns { signedUrl, storedFilename } so the report document can cache storedFilename.
 */
export async function uploadReportPdfAndGetSignedUrl(
  reportId: string,
  filename: string,
  pdfBuffer: Buffer
): Promise<{ signedUrl: string; storedFilename: string }> {
  const bucket = storage.bucket();
  const safeName = reportPdfSafeName(filename);
  const filePath = `${REPORTS_PREFIX}/${reportId}/${safeName}`;
  const file = bucket.file(filePath);

  const contentDisposition = `attachment; filename="${safeName}"`;
  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      contentType: 'application/pdf',
      contentDisposition,
    },
  });

  const expires = new Date(Date.now() + SIGNED_URL_EXPIRY_MS);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires,
  });

  logger.info(`Report PDF uploaded: ${filePath}`);
  return { signedUrl, storedFilename: safeName };
}
