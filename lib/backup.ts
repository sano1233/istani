/**
 * Backup and Restore System
 * Complete data backup, incremental backups, and restoration
 */

export interface BackupData {
  version: string;
  timestamp: string;
  user_id: string;
  backup_type: 'full' | 'incremental';
  data: {
    profile?: any;
    workouts?: any[];
    meals?: any[];
    body_measurements?: any[];
    achievements?: any[];
    friends?: any[];
    challenges?: any[];
    settings?: any;
    nutrition_goals?: any;
    workout_plans?: any[];
    recipes?: any[];
    meal_plans?: any[];
  };
  metadata: {
    total_size: number; // bytes
    record_counts: Record<string, number>;
    created_by: string;
    checksum?: string;
  };
}

export interface BackupHistory {
  id: string;
  user_id: string;
  backup_type: 'full' | 'incremental';
  timestamp: string;
  size: number;
  status: 'completed' | 'in_progress' | 'failed';
  download_url?: string;
  error_message?: string;
}

export class BackupService {
  private static readonly BACKUP_VERSION = '1.0';
  private static readonly MAX_BACKUP_SIZE = 100 * 1024 * 1024; // 100MB

  /**
   * Create full backup of all user data
   */
  static async createFullBackup(userId: string): Promise<BackupData> {
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          backup_type: 'full',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Create incremental backup (only changed data since last backup)
   */
  static async createIncrementalBackup(
    userId: string,
    sinceTimestamp: string
  ): Promise<BackupData> {
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          backup_type: 'incremental',
          since: sinceTimestamp,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create incremental backup');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating incremental backup:', error);
      throw error;
    }
  }

  /**
   * Download backup as file
   */
  static async downloadBackup(backupData: BackupData, filename?: string): Promise<void> {
    try {
      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        filename || `istani-backup-${backupData.backup_type}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreBackup(userId: string, backupFile: File): Promise<void> {
    try {
      const text = await backupFile.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate backup
      if (!this.validateBackup(backupData)) {
        throw new Error('Invalid backup file format');
      }

      // Check version compatibility
      if (backupData.version !== this.BACKUP_VERSION) {
        console.warn(
          `Backup version mismatch: ${backupData.version} vs ${this.BACKUP_VERSION}`
        );
      }

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          backup_data: backupData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  /**
   * Get backup history
   */
  static async getBackupHistory(userId: string): Promise<BackupHistory[]> {
    try {
      const response = await fetch(`/api/backup/history?user_id=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch backup history');
      }

      const data = await response.json();
      return data.backups || [];
    } catch (error) {
      console.error('Error fetching backup history:', error);
      return [];
    }
  }

  /**
   * Delete old backup
   */
  static async deleteBackup(backupId: string): Promise<void> {
    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic backups
   */
  static async scheduleBackup(
    userId: string,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    try {
      const response = await fetch('/api/backup/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          frequency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule backup');
      }
    } catch (error) {
      console.error('Error scheduling backup:', error);
      throw error;
    }
  }

  /**
   * Get scheduled backup settings
   */
  static async getBackupSchedule(userId: string): Promise<{
    enabled: boolean;
    frequency: string;
    next_backup: string;
  } | null> {
    try {
      const response = await fetch(`/api/backup/schedule?user_id=${userId}`);

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching backup schedule:', error);
      return null;
    }
  }

  /**
   * Validate backup data structure
   */
  private static validateBackup(backup: any): boolean {
    if (!backup || typeof backup !== 'object') return false;
    if (!backup.version || !backup.timestamp || !backup.user_id) return false;
    if (!backup.data || typeof backup.data !== 'object') return false;
    if (!backup.metadata || typeof backup.metadata !== 'object') return false;
    return true;
  }

  /**
   * Calculate backup checksum for integrity verification
   */
  static async calculateChecksum(data: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      // Fallback for environments without Web Crypto API
      return this.simpleHash(data);
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error calculating checksum:', error);
      return this.simpleHash(data);
    }
  }

  /**
   * Simple hash fallback
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Compress backup data
   */
  static async compressBackup(backupData: BackupData): Promise<Blob> {
    const json = JSON.stringify(backupData);

    // In production, use compression library like pako or fflate
    // For now, just create a blob
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Upload backup to cloud storage
   */
  static async uploadToCloud(
    userId: string,
    backupData: BackupData
  ): Promise<{ url: string; id: string }> {
    try {
      const blob = await this.compressBackup(backupData);
      const formData = new FormData();
      formData.append('file', blob, `backup-${Date.now()}.json`);
      formData.append('user_id', userId);

      const response = await fetch('/api/backup/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload backup');
      }

      return response.json();
    } catch (error) {
      console.error('Error uploading backup:', error);
      throw error;
    }
  }

  /**
   * Download backup from cloud storage
   */
  static async downloadFromCloud(backupId: string): Promise<BackupData> {
    try {
      const response = await fetch(`/api/backup/download/${backupId}`);

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      return response.json();
    } catch (error) {
      console.error('Error downloading backup from cloud:', error);
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  static async verifyBackup(backup: BackupData): Promise<boolean> {
    try {
      if (!this.validateBackup(backup)) {
        return false;
      }

      if (backup.metadata.checksum) {
        const dataStr = JSON.stringify(backup.data);
        const calculatedChecksum = await this.calculateChecksum(dataStr);
        return calculatedChecksum === backup.metadata.checksum;
      }

      return true; // No checksum to verify
    } catch (error) {
      console.error('Error verifying backup:', error);
      return false;
    }
  }

  /**
   * Get backup size estimate
   */
  static estimateBackupSize(recordCounts: Record<string, number>): number {
    // Rough estimate: average 1KB per record
    const totalRecords = Object.values(recordCounts).reduce((sum, count) => sum + count, 0);
    return totalRecords * 1024; // bytes
  }

  /**
   * Clean up old backups (keep last N backups)
   */
  static async cleanupOldBackups(userId: string, keepCount: number = 5): Promise<void> {
    try {
      const response = await fetch('/api/backup/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          keep_count: keepCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup backups');
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error);
      throw error;
    }
  }
}

export default BackupService;
