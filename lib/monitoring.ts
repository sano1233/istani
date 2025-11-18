/**
 * Performance Monitoring and Analytics System
 */

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'page_load' | 'api_call' | 'database_query' | 'render' | 'interaction';
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  event_type: string;
  user_id?: string;
  session_id: string;
  properties?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitals();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track page load performance
   */
  public trackPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (perfData) {
      this.recordMetric({
        type: 'page_load',
        name: pageName,
        duration: perfData.loadEventEnd - perfData.fetchStart,
        metadata: {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstPaint: this.getFirstPaint(),
          timeToInteractive: perfData.domInteractive - perfData.fetchStart,
        },
      });
    }
  }

  /**
   * Track API call performance
   */
  public async trackAPICall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: 'api_call',
        name,
        duration,
        metadata: { success: true },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: 'api_call',
        name,
        duration,
        metadata: { success: false, error: (error as Error).message },
      });

      throw error;
    }
  }

  /**
   * Track component render performance
   */
  public trackRender(componentName: string, renderTime: number): void {
    this.recordMetric({
      type: 'render',
      name: componentName,
      duration: renderTime,
    });
  }

  /**
   * Track user interaction
   */
  public trackInteraction(interactionName: string, startTime: number): void {
    const duration = performance.now() - startTime;

    this.recordMetric({
      type: 'interaction',
      name: interactionName,
      duration,
    });
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    averagePageLoad: number;
    averageAPICall: number;
    slowestAPICalls: PerformanceMetric[];
    totalMetrics: number;
  } {
    const pageLoads = this.metrics.filter(m => m.type === 'page_load');
    const apiCalls = this.metrics.filter(m => m.type === 'api_call');

    return {
      averagePageLoad: pageLoads.length > 0
        ? pageLoads.reduce((sum, m) => sum + m.duration, 0) / pageLoads.length
        : 0,
      averageAPICall: apiCalls.length > 0
        ? apiCalls.reduce((sum, m) => sum + m.duration, 0) / apiCalls.length
        : 0,
      slowestAPICalls: apiCalls
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      totalMetrics: this.metrics.length,
    };
  }

  /**
   * Send metrics to analytics service
   */
  public async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          metrics: this.metrics,
        }),
      });

      this.metrics = [];
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  private observeLCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        this.recordMetric({
          type: 'page_load',
          name: 'LCP',
          duration: lastEntry.renderTime || lastEntry.loadTime,
          metadata: { url: window.location.href },
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private observeFID(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            type: 'interaction',
            name: 'FID',
            duration: entry.processingStart - entry.startTime,
          });
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  private observeCLS(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      let clsScore = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });

        this.recordMetric({
          type: 'page_load',
          name: 'CLS',
          duration: clsScore,
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  /**
   * Get First Paint timing
   */
  private getFirstPaint(): number {
    if (typeof window === 'undefined') return 0;

    const paintEntries = window.performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');

    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    this.metrics.push({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...metric,
    });

    // Auto-flush when we have too many metrics
    if (this.metrics.length >= 100) {
      this.flush();
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Analytics tracker
 */
export class Analytics {
  private static instance: Analytics;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Track event
   */
  public track(eventType: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      event_type: eventType,
      session_id: this.sessionId,
      properties,
    };

    this.sendEvent(event);
  }

  /**
   * Track page view
   */
  public pageView(pageName: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page_name: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...properties,
    });
  }

  /**
   * Track user action
   */
  public action(actionName: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action_name: actionName,
      ...properties,
    });
  }

  /**
   * Send event to analytics service
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export const analytics = Analytics.getInstance();
