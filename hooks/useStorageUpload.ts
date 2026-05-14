import { useState, useCallback } from 'react';
import { uploadFile, deleteFile, type StorageBucket, type UploadResult } from '../lib/storage';

interface UseUploadOptions {
  bucket: StorageBucket;
}

export function useStorageUpload({ bucket }: UseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const upload = useCallback(
    async (uri: string, mimeType?: string) => {
      setUploading(true);
      setProgress(0);
      setError(null);
      setResult(null);
      try {
        setProgress(30);
        const res = await uploadFile(bucket, uri, mimeType);
        setProgress(100);
        setResult(res);
        return res;
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [bucket]
  );

  const remove = useCallback(
    async (path: string) => {
      setError(null);
      try {
        await deleteFile(bucket, path);
        setResult(null);
      } catch (err: any) {
        setError(err.message || 'Delete failed');
        throw err;
      }
    },
    [bucket]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { upload, remove, reset, uploading, progress, error, result, url: result?.url ?? null };
}
