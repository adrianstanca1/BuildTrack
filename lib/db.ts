import { supabase } from './supabase';

export type StorageBucket = 'buildtrack-photos' | 'buildtrack-drawings' | 'buildtrack-documents';

export const TABLE = {
  projects: 'projects',
  tasks: 'tasks',
  workers: 'workers',
  incidents: 'incidents',
  inspections: 'inspections',
  photos: 'photos',
  notifications: 'notifications',
  profiles: 'profiles',
  drawings: 'drawings',
  site_photos: 'site_photos',
  rfis: 'rfis',
  submittals: 'submittals',
  punch_items: 'punch_items',
  delay_notes: 'delay_notes',
  timesheets: 'timesheets',
  permits: 'permits',
  defects: 'defects',
  materials: 'materials',
  equipment: 'equipment',
  meetings: 'meetings',
  purchase_orders: 'purchase_orders',
  invoices: 'invoices',
  change_orders: 'change_orders',
  budgets: 'budgets',
  documents: 'documents',
} as const;

export type TableName = (typeof TABLE)[keyof typeof TABLE];

// ─── Generic CRUD ────────────────────────────────────────────────────────

export async function fetchTable<T = Record<string, any>>(
  table: TableName,
  opts?: { columns?: string; filters?: Record<string, string | number | boolean>; order?: { column: string; asc?: boolean }; limit?: number; userScoped?: boolean }
): Promise<T[]> {
  let q = supabase.from(table).select(opts?.columns || '*');
  if (opts?.userScoped) {
    const { data: u } = await supabase.auth.getUser();
    q = q.eq('user_id', u.user?.id);
  }
  if (opts?.filters) {
    Object.entries(opts.filters).forEach(([col, val]) => {
      q = q.eq(col, val);
    });
  }
  if (opts?.order) q = q.order(opts.order.column, { ascending: opts.order.asc ?? false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as T[];
}

export async function fetchOne<T = Record<string, any>>(table: TableName, id: string, columns?: string) {
  const { data, error } = await supabase.from(table).select(columns || '*').eq('id', id).single();
  if (error) throw error;
  return data as T;
}

export async function insertRow<T = Record<string, any>>(table: TableName, row: Record<string, any>) {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase.from(table).insert({ ...row, user_id: u.user?.id }).select().single();
  if (error) throw error;
  return data as T;
}

export async function updateRow(table: TableName, id: string, updates: Record<string, any>) {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: TableName, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

/* ─── Dashboard / stats helpers ─────────────────────────────────────────── */

export async function getDashboardStats() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return { totalProjects: 0, activeProjects: 0, totalTasks: 0, pendingTasks: 0, avgProgress: 0, totalWorkers: 0 };

  const [{ data: projects }, { data: tasks }, { data: workers }] = await Promise.all([
    supabase.from('projects').select('id, status, progress'),
    supabase.from('tasks').select('status'),
    supabase.from('workers').select('id'),
  ]);

  return {
    totalProjects: projects?.length ?? 0,
    activeProjects: projects?.filter((p) => p.status === 'active').length ?? 0,
    totalTasks: tasks?.length ?? 0,
    pendingTasks: tasks?.filter((t) => t.status === 'pending').length ?? 0,
    avgProgress: projects?.length
      ? Math.round((projects.reduce((a, b) => a + (b.progress || 0), 0) / projects.length) * 10) / 10
      : 0,
    totalWorkers: workers?.length ?? 0,
  };
}

/* ─── Storage ───────────────────────────────────────────────────────────── */

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function uploadFile(bucket: StorageBucket, uri: string, mimeType?: string) {
  let fileData: ArrayBuffer;
  if (uri.startsWith('data:')) {
    const base64 = uri.split(',')[1];
    if (!base64) throw new Error('Invalid data URI');
    fileData = base64ToArrayBuffer(base64);
  } else {
    const FileSystem = await import('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    fileData = base64ToArrayBuffer(base64);
  }

  const ext = (uri.match(/\.([a-zA-Z0-9]+)(\?.*)?$/)?.[1] || (mimeType?.includes('pdf') ? 'pdf' : 'jpg')).toLowerCase();
  const prefix = bucket.replace('buildtrack-', '');
  const path = `${prefix}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, fileData, {
    contentType: mimeType || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, bucket };
}

export async function deleteFile(bucket: StorageBucket, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: StorageBucket, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
