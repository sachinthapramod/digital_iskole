import { storage } from '../config/firebase';
import logger from './logger';

const REPORTS_PREFIX = 'reports';
const SIGNED_URL_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Upload report PDF to Firebase Storage and return a signed download URL.
 * Path: reports/{reportId}/{filename}
 */
export async function uploadReportPdfAndGetSignedUrl(
  reportId: string,
  filename: string,
  pdfBuffer: Buffer
): Promise<string> {
  const bucket = storage.bucket();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
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
  return signedUrl;
}
