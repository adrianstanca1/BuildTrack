import { create } from 'zustand';

export type NotificationType = 'task' | 'project' | 'safety' | 'team' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  relatedId?: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  lastRefreshed: number | null;
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastRefreshed: (timestamp: number) => void;
  getUnreadCount: () => number;
  getGroupedNotifications: () => Record<string, AppNotification[]>;
}

function getNotificationTypeFromString(type: string): NotificationType {
  const validTypes: NotificationType[] = ['task', 'project', 'safety', 'team', 'general'];
  return validTypes.includes(type as NotificationType) ? (type as NotificationType) : 'general';
}

export function mapDbNotification(db: any): AppNotification {
  return {
    id: db.id,
    title: db.title,
    body: db.body,
    type: getNotificationTypeFromString(db.type),
    relatedId: db.related_id,
    read: db.read,
    createdAt: db.created_at,
    userId: db.user_id,
  };
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
  lastRefreshed: null,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount, error: null });
  },

  addNotification: (notification) => {
    const state = get();
    const exists = state.notifications.some((n) => n.id === notification.id);
    if (exists) return;
    const notifications = [notification, ...state.notifications];
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id) => {
    const state = get();
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAllAsRead: () => {
    const state = get();
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    set({ notifications, unreadCount: 0 });
  },

  deleteNotification: (id) => {
    const state = get();
    const notifications = state.notifications.filter((n) => n.id !== id);
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLastRefreshed: (lastRefreshed) => set({ lastRefreshed }),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

  getGroupedNotifications: () => {
    const { notifications } = get();
    const groups: Record<string, AppNotification[]> = {};

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      let groupKey: string;
      if (dateKey.getTime() === today.getTime()) {
        groupKey = 'Today';
      } else if (dateKey.getTime() === yesterday.getTime()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(notification);
    });

    return groups;
  },
}));
