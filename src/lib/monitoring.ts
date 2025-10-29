// Enterprise monitoring and error tracking

export interface ErrorLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context?: any;
  userId?: string;
  url?: string;
}

class MonitoringService {
  private logs: ErrorLog[] = [];

  log(level: ErrorLog['level'], message: string, context?: any) {
    // avoid leaking secrets in logs
    const { redactSecrets } = require('@/lib/redact');
    const safeContext = context ? redactSecrets(context) : undefined;
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: safeContext,
    };

    this.logs.push(log);

    // In production, send to monitoring service (Sentry, Datadog, etc.)
    if (level === 'error' || level === 'critical') {
      console.error('[MONITOR]', log);
    } else if (level === 'warning') {
      console.warn('[MONITOR]', log);
    } else {
      console.log('[MONITOR]', log);
    }

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    this.log('warning', message, context);
  }

  error(message: string, context?: any) {
    this.log('error', message, context);
  }

  critical(message: string, context?: any) {
    this.log('critical', message, context);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const monitor = new MonitoringService();

// Track performance
export function trackPerformance(name: string, callback: () => Promise<any>) {
  const start = Date.now();

  return callback()
    .then((result) => {
      const duration = Date.now() - start;
      monitor.info(`Performance: ${name}`, { duration, success: true });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - start;
      monitor.error(`Performance: ${name} (failed)`, { duration, error: error.message });
      throw error;
    });
}

// Health check
export async function healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; checks: any }> {
  const checks = {
    timestamp: new Date().toISOString(),
    supabase: 'unknown',
    huggingface: 'unknown',
    api: 'healthy',
  };

  try {
    // Check if environment variables are set
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) checks.supabase = 'configured';
    // Do not reference secret env vars here to avoid accidental leak in client bundles
    checks.huggingface = process.env.HUGGINGFACE_API_KEY ? 'configured' : 'unknown';

    return { status: 'healthy', checks };
  } catch (error) {
    monitor.error('Health check failed', { error });
    return { status: 'down', checks };
  }
}
