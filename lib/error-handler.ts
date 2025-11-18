/**
 * Comprehensive Error Handling and Logging System
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  PAYMENT = 'payment',
  INTEGRATION = 'integration',
  UNKNOWN = 'unknown',
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  userId?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

export class AppError extends Error {
  public severity: ErrorSeverity;
  public category: ErrorCategory;
  public metadata?: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.severity = severity;
    this.metadata = metadata;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: ErrorLog[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Log an error
   */
  public async logError(
    error: Error | AppError,
    userId?: string,
    additionalMetadata?: Record<string, any>
  ): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      severity: error instanceof AppError ? error.severity : ErrorSeverity.MEDIUM,
      category: error instanceof AppError ? error.category : ErrorCategory.UNKNOWN,
      message: error.message,
      stack: error.stack,
      userId,
      metadata: {
        ...(error instanceof AppError ? error.metadata : {}),
        ...additionalMetadata,
      },
      resolved: false,
    };

    // Add to in-memory logs
    this.errorLogs.push(errorLog);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorLog.severity.toUpperCase()}] ${errorLog.category}:`, errorLog.message);
      if (errorLog.stack) console.error(errorLog.stack);
    }

    // Send to external logging service (e.g., Sentry, DataDog)
    await this.sendToExternalService(errorLog);

    // Save to database for critical errors
    if (errorLog.severity === ErrorSeverity.CRITICAL || errorLog.severity === ErrorSeverity.HIGH) {
      await this.saveToDatabase(errorLog);
    }

    // Send alert for critical errors
    if (errorLog.severity === ErrorSeverity.CRITICAL) {
      await this.sendAlert(errorLog);
    }
  }

  /**
   * Get recent error logs
   */
  public getRecentErrors(limit: number = 50): ErrorLog[] {
    return this.errorLogs.slice(-limit);
  }

  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.errorLogs.filter(log => log.category === category);
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.errorLogs.filter(log => log.severity === severity);
  }

  /**
   * Clear resolved errors
   */
  public clearResolvedErrors(): void {
    this.errorLogs = this.errorLogs.filter(log => !log.resolved);
  }

  /**
   * Mark error as resolved
   */
  public markAsResolved(errorId: string): void {
    const error = this.errorLogs.find(log => log.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Send error to external logging service
   */
  private async sendToExternalService(errorLog: ErrorLog): Promise<void> {
    try {
      // Integration with Sentry, DataDog, or custom logging service
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // TODO: Send to Sentry
      }
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  /**
   * Save error to database
   */
  private async saveToDatabase(errorLog: ErrorLog): Promise<void> {
    try {
      // Save to Supabase or other database
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      });
    } catch (error) {
      console.error('Failed to save error to database:', error);
    }
  }

  /**
   * Send alert for critical errors
   */
  private async sendAlert(errorLog: ErrorLog): Promise<void> {
    try {
      // Send email, Slack notification, or SMS for critical errors
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `CRITICAL ERROR: ${errorLog.category}`,
          message: errorLog.message,
          metadata: errorLog.metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to send critical error alert:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Global error handler
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * React Error Boundary helper
 */
export function handleReactError(error: Error, errorInfo: any): void {
  errorHandler.logError(
    new AppError(
      error.message,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      { componentStack: errorInfo.componentStack }
    )
  );
}

/**
 * API error handler
 */
export function handleAPIError(error: any): Response {
  const appError = error instanceof AppError
    ? error
    : new AppError(error.message || 'Internal server error', ErrorCategory.API, ErrorSeverity.MEDIUM);

  errorHandler.logError(appError);

  const statusCode =
    appError.severity === ErrorSeverity.CRITICAL ? 500 :
    appError.severity === ErrorSeverity.HIGH ? 500 :
    appError.category === ErrorCategory.AUTHENTICATION ? 401 :
    appError.category === ErrorCategory.VALIDATION ? 400 :
    500;

  return new Response(
    JSON.stringify({
      error: appError.message,
      category: appError.category,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Database error handler
 */
export function handleDatabaseError(error: any): AppError {
  return new AppError(
    error.message || 'Database operation failed',
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    { originalError: error }
  );
}

/**
 * Network error handler
 */
export function handleNetworkError(error: any): AppError {
  return new AppError(
    'Network request failed',
    ErrorCategory.NETWORK,
    ErrorSeverity.MEDIUM,
    { originalError: error }
  );
}

/**
 * Validation error handler
 */
export function handleValidationError(errors: Record<string, string>): AppError {
  return new AppError(
    'Validation failed',
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    { validationErrors: errors }
  );
}

export default errorHandler;
