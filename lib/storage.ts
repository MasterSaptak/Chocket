import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadProductImage(file: File, userId: string): Promise<string> {
  const safeFileName = sanitizeFileName(file.name);
  const storageRef = ref(storage, `products/${userId}/${Date.now()}-${safeFileName}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
  });

  return getDownloadURL(storageRef);
}
