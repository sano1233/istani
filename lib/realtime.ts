/**
 * Real-time WebSocket Features
 * Live updates for social features, notifications, and data sync
 */

import { createClient } from '@/lib/supabase/client';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  channel: string;
  unsubscribe: () => void;
}

export class RealtimeManager {
  private static instance: RealtimeManager;
  private subscriptions: Map<string, any> = new Map();
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Subscribe to user's activity feed
   */
  public subscribeToActivityFeed(
    userId: string,
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `activity_feed:${userId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Subscribe to friend requests
   */
  public subscribeToFriendRequests(
    userId: string,
    onRequest: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `friend_requests:${userId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${userId}`,
        },
        (payload) => {
          onRequest(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Subscribe to challenge leaderboard updates
   */
  public subscribeToChallengeLeaderboard(
    challengeId: string,
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `challenge_leaderboard:${challengeId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${challengeId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Subscribe to user's notifications
   */
  public subscribeToNotifications(
    userId: string,
    onNotification: (notification: any) => void
  ): RealtimeSubscription {
    const channelName = `notifications:${userId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Broadcast presence (online/offline status)
   */
  public async broadcastPresence(userId: string, status: 'online' | 'offline' | 'away') {
    const channel = this.supabase.channel('presence');

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          status,
          last_seen: new Date().toISOString(),
        });
      }
    });

    return {
      channel: 'presence',
      unsubscribe: () => channel.unsubscribe(),
    };
  }

  /**
   * Subscribe to presence updates (see who's online)
   */
  public subscribeToPresence(
    onPresenceChange: (presences: any[]) => void
  ): RealtimeSubscription {
    const channelName = 'presence';

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const presences = channel.presenceState();
        onPresenceChange(Object.values(presences).flat());
      })
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Send a broadcast message to all connected clients
   */
  public async broadcast(channel: string, event: string, payload: any) {
    const ch = this.supabase.channel(channel);
    await ch.send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  /**
   * Subscribe to broadcast messages
   */
  public subscribeToBroadcast(
    channel: string,
    event: string,
    onMessage: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `broadcast:${channel}:${event}`;

    const ch = this.supabase
      .channel(channel)
      .on('broadcast', { event }, (payload) => {
        onMessage(payload);
      })
      .subscribe();

    this.subscriptions.set(channelName, ch);

    return {
      channel: channelName,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' {
    // Check if any subscriptions are active
    for (const [_, subscription] of this.subscriptions) {
      return subscription.state;
    }
    return 'CLOSED';
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();

/**
 * React hook for realtime subscriptions
 */
export function useRealtime() {
  return {
    subscribeToActivityFeed: realtimeManager.subscribeToActivityFeed.bind(realtimeManager),
    subscribeToFriendRequests: realtimeManager.subscribeToFriendRequests.bind(realtimeManager),
    subscribeToChallengeLeaderboard: realtimeManager.subscribeToChallengeLeaderboard.bind(realtimeManager),
    subscribeToNotifications: realtimeManager.subscribeToNotifications.bind(realtimeManager),
    broadcastPresence: realtimeManager.broadcastPresence.bind(realtimeManager),
    subscribeToPresence: realtimeManager.subscribeToPresence.bind(realtimeManager),
    broadcast: realtimeManager.broadcast.bind(realtimeManager),
    subscribeToBroadcast: realtimeManager.subscribeToBroadcast.bind(realtimeManager),
    unsubscribeAll: realtimeManager.unsubscribeAll.bind(realtimeManager),
    getConnectionStatus: realtimeManager.getConnectionStatus.bind(realtimeManager),
  };
}
