'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackupService, { type BackupHistory, type BackupData } from '@/lib/backup';

export default function BackupPage() {
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [schedule, setSchedule] = useState<{
    enabled: boolean;
    frequency: string;
    next_backup: string;
  } | null>(null);

  // Mock user ID - in production, get from auth context
  const userId = 'mock-user-id';

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    setLoading(true);
    try {
      const [history, scheduleData] = await Promise.all([
        BackupService.getBackupHistory(userId),
        BackupService.getBackupSchedule(userId),
      ]);
      setBackupHistory(history);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Failed to load backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (type: 'full' | 'incremental' = 'full') => {
    setCreating(true);
    try {
      let backup: BackupData;

      if (type === 'full') {
        backup = await BackupService.createFullBackup(userId);
      } else {
        const lastBackup = backupHistory[0];
        backup = await BackupService.createIncrementalBackup(
          userId,
          lastBackup?.timestamp || new Date().toISOString()
        );
      }

      await BackupService.downloadBackup(backup);
      await loadBackupData(); // Refresh history
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Restoring a backup will overwrite your current data. Continue?')) {
      return;
    }

    setRestoring(true);
    try {
      await BackupService.restoreBackup(userId, file);
      alert('Backup restored successfully! Please refresh the page.');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Failed to restore backup. Please check the file and try again.');
    } finally {
      setRestoring(false);
    }
  };

  const handleScheduleBackup = async (frequency: 'daily' | 'weekly' | 'monthly') => {
    try {
      await BackupService.scheduleBackup(userId, frequency);
      await loadBackupData();
      alert(`Backup scheduled ${frequency}!`);
    } catch (error) {
      console.error('Failed to schedule backup:', error);
      alert('Failed to schedule backup.');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      await BackupService.deleteBackup(backupId);
      await loadBackupData();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('Failed to delete backup.');
    }
  };

  const handleCleanupOldBackups = async () => {
    if (!confirm('This will delete all backups except the 5 most recent. Continue?')) {
      return;
    }

    try {
      await BackupService.cleanupOldBackups(userId, 5);
      await loadBackupData();
      alert('Old backups cleaned up successfully!');
    } catch (error) {
      console.error('Failed to cleanup backups:', error);
      alert('Failed to cleanup backups.');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading backup data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Protect your data with automatic backups and easy restoration
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Backup</CardTitle>
            <CardDescription>Download a complete backup of your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => handleCreateBackup('full')}
              disabled={creating}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Full Backup'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreateBackup('incremental')}
              disabled={creating || backupHistory.length === 0}
              className="w-full"
            >
              Incremental Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restore Backup</CardTitle>
            <CardDescription>Restore your data from a backup file</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              disabled={restoring}
              className="hidden"
              id="restore-file-input"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('restore-file-input')?.click()}
              disabled={restoring}
            >
              {restoring ? 'Restoring...' : 'Choose Backup File'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatic Backups</CardTitle>
            <CardDescription>Schedule regular backups</CardDescription>
          </CardHeader>
          <CardContent>
            {schedule?.enabled ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Frequency:</strong> {schedule.frequency}
                </p>
                <p className="text-sm">
                  <strong>Next:</strong> {new Date(schedule.next_backup).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScheduleBackup('daily')}
                  className="w-full"
                >
                  Daily
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScheduleBackup('weekly')}
                  className="w-full"
                >
                  Weekly
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Your recent backups</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCleanupOldBackups}>
              Cleanup Old Backups
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found. Create your first backup to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {backupHistory.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {backup.backup_type === 'full' ? '📦' : '📝'}
                      </span>
                      <div>
                        <p className="font-medium">
                          {backup.backup_type === 'full' ? 'Full Backup' : 'Incremental Backup'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(backup.timestamp).toLocaleString()} • {formatBytes(backup.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        backup.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : backup.status === 'failed'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {backup.status}
                    </span>
                    {backup.download_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(backup.download_url, '_blank')}
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBackup(backup.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Backups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Full Backup:</strong> Creates a complete copy of all your data including
            workouts, meals, measurements, achievements, and settings.
          </p>
          <p>
            <strong>Incremental Backup:</strong> Only backs up data that has changed since your
            last backup, making it faster and smaller.
          </p>
          <p>
            <strong>Automatic Backups:</strong> Schedule regular backups to ensure your data is
            always protected.
          </p>
          <p>
            <strong>Restoration:</strong> Upload a backup file to restore your data. This will
            overwrite your current data, so use with caution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
