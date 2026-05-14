import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export type StorageBucket = 'buildtrack-photos' | 'buildtrack-drawings' | 'buildtrack-documents';

export interface UploadResult {
  path: string;
  url: string;
  bucket: StorageBucket;
}

const BUCKET_CONFIG: Record<StorageBucket, { maxSize: number; mimeTypes: string[] }> = {
  'buildtrack-photos': {
    maxSize: 50 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  'buildtrack-drawings': {
    maxSize: 100 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  'buildtrack-documents': {
    maxSize: 100 * 1024 * 1024,
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/png',
      'image/jpeg',
    ],
  },
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getFileExtension(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  return match ? `.${match[1].toLowerCase()}` : '';
}

function generatePath(bucket: StorageBucket, ext: string): string {
  const prefix = bucket.replace('buildtrack-', '');
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${ts}_${rand}${ext}`;
}

export async function uploadFile(
  bucket: StorageBucket,
  uri: string,
  mimeType?: string
): Promise<UploadResult> {
  const config = BUCKET_CONFIG[bucket];

  let fileData: ArrayBuffer;
  if (uri.startsWith('data:')) {
    const base64 = uri.split(',')[1];
    if (!base64) throw new Error('Invalid data URI');
    fileData = base64ToArrayBuffer(base64);
  } else {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
    fileData = base64ToArrayBuffer(base64);
  }

  if (fileData.byteLength > config.maxSize) {
    throw new Error(`File exceeds max size of ${config.maxSize / 1024 / 1024}MB`);
  }

  const ext = getFileExtension(uri) || (mimeType?.includes('pdf') ? '.pdf' : '.jpg');
  const path = generatePath(bucket, ext);

  const { error } = await supabase.storage.from(bucket).upload(path, fileData, {
    contentType: mimeType || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    url: urlData.publicUrl,
    bucket,
  };
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function downloadFile(bucket: StorageBucket, path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function validateFile(uri: string, bucket: StorageBucket): string | null {
  const config = BUCKET_CONFIG[bucket];
  const ext = getFileExtension(uri);
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
  };
  const mime = mimeMap[ext] || 'application/octet-stream';
  if (!config.mimeTypes.includes(mime)) {
    return `Unsupported file type. Allowed: ${config.mimeTypes.join(', ')}`;
  }
  return null;
}
