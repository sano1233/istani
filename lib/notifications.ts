/**
 * Notification System
 * Push notifications, in-app notifications, and email alerts
 */

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'challenge_invite'
  | 'challenge_completed'
  | 'achievement_unlocked'
  | 'workout_reminder'
  | 'meal_reminder'
  | 'progress_update'
  | 'comment'
  | 'like'
  | 'mention';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private pushSupported: boolean = false;
  private pushPermission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.pushSupported = 'Notification' in window;
      this.pushPermission = this.pushSupported ? Notification.permission : 'default';
    }
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Request push notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.pushSupported) {
      return 'denied';
    }

    try {
      this.pushPermission = await Notification.requestPermission();
      return this.pushPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show push notification
   */
  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.pushSupported || this.pushPermission !== 'granted') {
      console.warn('Push notifications not supported or not permitted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options,
      } as NotificationOptions);

      notification.onclick = (event) => {
        event.preventDefault();
        if (options?.data?.url) {
          window.open(options.data.url, '_blank');
        }
        notification.close();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Create in-app notification
   */
  public async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type,
          title,
          message,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  public async getNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        ...(unreadOnly && { unread_only: 'true' }),
      });

      const response = await fetch(`/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(userId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Delete notification
   */
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * Send email notification
   */
  public async sendEmailNotification(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<void> {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Subscribe to push notifications (service worker)
   */
  public async subscribeToPush(userId: string): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey ? this.urlBase64ToUint8Array(vapidKey) as any : undefined,
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          subscription,
        }),
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribeFromPush(userId: string): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  /**
   * Get notification preferences
   */
  public async getPreferences(userId: string): Promise<Record<NotificationType, boolean>> {
    try {
      const response = await fetch(`/api/notifications/preferences?user_id=${userId}`);
      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return {} as Record<NotificationType, boolean>;
    }
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(
    userId: string,
    preferences: Partial<Record<NotificationType, boolean>>
  ): Promise<void> {
    try {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          preferences,
        }),
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Helper: Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Check if notifications are supported
   */
  public isSupported(): boolean {
    return this.pushSupported;
  }

  /**
   * Get permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return this.pushPermission;
  }
}

export const notificationManager = NotificationManager.getInstance();
