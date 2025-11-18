/**
 * Centralized Logging Utility
 * Provides structured logging with context and error tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.environment === 'development') {
      // Pretty print for development
      return JSON.stringify(entry, null, 2);
    }
    // Single line JSON for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.environment === 'development' ? error.stack : undefined,
      };
    }

    const formattedLog = this.formatLogEntry(entry);

    switch (level) {
      case 'debug':
        if (this.environment === 'development') {
          console.debug(formattedLog);
        }
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }

    // In production, you could send to a logging service here
    // Example: Sentry, LogRocket, Datadog, etc.
    if (this.environment === 'production' && level === 'error') {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { custom: context } });
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }

  // API-specific logging helpers
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      method,
      path,
    });
  }

  apiResponse(
    method: string,
    path: string,
    status: number,
    duration?: number,
    context?: LogContext,
  ) {
    this.info(`API Response: ${method} ${path} - ${status}`, {
      ...context,
      method,
      path,
      status,
      duration,
    });
  }

  apiError(method: string, path: string, error: Error, context?: LogContext) {
    this.error(`API Error: ${method} ${path}`, error, {
      ...context,
      method,
      path,
    });
  }

  // Database operation logging
  dbQuery(operation: string, table: string, context?: LogContext) {
    this.debug(`DB Query: ${operation} on ${table}`, {
      ...context,
      operation,
      table,
    });
  }

  dbError(operation: string, table: string, error: Error, context?: LogContext) {
    this.error(`DB Error: ${operation} on ${table}`, error, {
      ...context,
      operation,
      table,
    });
  }

  // External API logging
  externalApiRequest(service: string, endpoint: string, context?: LogContext) {
    this.info(`External API Request: ${service} ${endpoint}`, {
      ...context,
      service,
      endpoint,
    });
  }

  externalApiError(service: string, endpoint: string, error: Error, context?: LogContext) {
    this.error(`External API Error: ${service} ${endpoint}`, error, {
      ...context,
      service,
      endpoint,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export helper function for creating request context
export function createRequestContext(request: Request, userId?: string): LogContext {
  const url = new URL(request.url);

  return {
    userId,
    path: url.pathname,
    method: request.method,
    requestId: request.headers.get('x-request-id') || undefined,
  };
}

// Performance monitoring helper
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }

  end(context?: LogContext) {
    const duration = Date.now() - this.startTime;
    logger.debug(`Performance: ${this.label} took ${duration}ms`, {
      ...context,
      duration,
      label: this.label,
    });
    return duration;
  }
}
