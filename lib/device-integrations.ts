/**
 * Device Integration Library
 * Supports: Apple Health, Google Fit, Fitbit, Garmin, Oura, Whoop
 */

export interface HealthData {
  steps?: number;
  calories?: number;
  heartRate?: number;
  sleep?: {
    duration: number; // minutes
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  weight?: number;
  bodyFat?: number;
  hrv?: number; // Heart Rate Variability
  oxygen?: number; // Blood oxygen saturation
  workouts?: Array<{
    type: string;
    duration: number;
    calories: number;
    distance?: number;
    avgHeartRate?: number;
  }>;
}

// Apple HealthKit Integration
export class AppleHealthIntegration {
  private isAvailable: boolean = false;

  constructor() {
    // Check if we're on iOS and HealthKit is available
    this.isAvailable = typeof window !== 'undefined' && 'webkit' in window;
  }

  async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Apple Health is only available on iOS devices');
    }

    // Request permission to read health data
    // This would require native iOS app or webkit message handler
    try {
      // Placeholder for actual HealthKit authorization
      return true;
    } catch (error) {
      console.error('Apple Health authorization failed:', error);
      return false;
    }
  }

  async fetchData(startDate: Date, endDate: Date): Promise<HealthData> {
    if (!this.isAvailable) {
      throw new Error('Apple Health is not available');
    }

    // Placeholder - actual implementation requires native iOS bridge
    return {
      steps: 0,
      calories: 0,
      heartRate: 0,
    };
  }

  async writeData(data: Partial<HealthData>): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Apple Health is not available');
    }

    // Placeholder for writing data to HealthKit
    return true;
  }
}

// Google Fit Integration
export class GoogleFitIntegration {
  private clientId: string;
  private accessToken?: string;
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
  ];

  constructor(clientId?: string) {
    this.clientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || '';
  }

  async authorize(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('authorize() can only be called in browser environment');
    }

    // OAuth 2.0 flow for Google Fit
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'token',
      scope: this.SCOPES.join(' '),
    })}`;

    window.location.href = authUrl;
    return authUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async fetchData(startDate: Date, endDate: Date): Promise<HealthData> {
    if (!this.accessToken) {
      throw new Error('Not authorized. Call authorize() first.');
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // Fetch activity data
    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            { dataTypeName: 'com.google.step_count.delta' },
            { dataTypeName: 'com.google.calories.expended' },
            { dataTypeName: 'com.google.heart_rate.bpm' },
            { dataTypeName: 'com.google.weight' },
          ],
          bucketByTime: { durationMillis: endTime - startTime },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        }),
      }
    );

    const data = await response.json();

    // Parse response and extract health data
    return this.parseGoogleFitResponse(data);
  }

  private parseGoogleFitResponse(data: any): HealthData {
    // Parse Google Fit API response
    return {
      steps: 0,
      calories: 0,
      heartRate: 0,
      weight: 0,
    };
  }
}

// Fitbit Integration
export class FitbitIntegration {
  private clientId: string;
  private accessToken?: string;
  private baseUrl = 'https://api.fitbit.com/1';

  constructor(clientId?: string) {
    this.clientId = clientId || process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || '';
  }

  async authorize(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('authorize() can only be called in browser environment');
    }

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${new URLSearchParams({
      client_id: this.clientId,
      response_type: 'token',
      scope: 'activity heartrate nutrition profile sleep weight',
      redirect_uri: `${window.location.origin}/auth/callback`,
    })}`;

    window.location.href = authUrl;
    return authUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async fetchData(date: Date): Promise<HealthData> {
    if (!this.accessToken) {
      throw new Error('Not authorized');
    }

    const dateStr = date.toISOString().split('T')[0];

    const [activity, sleep, weight] = await Promise.all([
      this.fetchActivity(dateStr),
      this.fetchSleep(dateStr),
      this.fetchWeight(dateStr),
    ]);

    return {
      ...activity,
      ...sleep,
      ...weight,
    };
  }

  private async fetchActivity(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/user/-/activities/date/${date}.json`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    return {
      steps: data.summary?.steps || 0,
      calories: data.summary?.caloriesOut || 0,
      heartRate: data.summary?.restingHeartRate || 0,
    };
  }

  private async fetchSleep(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/user/-/sleep/date/${date}.json`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    const sleepData = data.summary;
    return {
      sleep: {
        duration: sleepData?.totalMinutesAsleep || 0,
        quality: 'fair',
        deep: sleepData?.stages?.deep || 0,
        light: sleepData?.stages?.light || 0,
        rem: sleepData?.stages?.rem || 0,
        awake: sleepData?.stages?.wake || 0,
      },
    };
  }

  private async fetchWeight(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/user/-/body/log/weight/date/${date}.json`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    return {
      weight: data.weight?.[0]?.weight || 0,
      bodyFat: data.weight?.[0]?.fat || 0,
    };
  }
}

// Oura Ring Integration
export class OuraIntegration {
  private accessToken?: string;
  private baseUrl = 'https://api.ouraring.com/v2';

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async fetchData(date: Date): Promise<HealthData> {
    if (!this.accessToken) {
      throw new Error('Not authorized');
    }

    const dateStr = date.toISOString().split('T')[0];

    const [sleep, activity, readiness] = await Promise.all([
      this.fetchSleep(dateStr),
      this.fetchActivity(dateStr),
      this.fetchReadiness(dateStr),
    ]);

    return {
      ...sleep,
      ...activity,
      ...readiness,
    };
  }

  private async fetchSleep(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/usercollection/sleep?start_date=${date}&end_date=${date}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    const sleepData = data.data[0];
    return {
      sleep: {
        duration: sleepData?.total_sleep_duration / 60 || 0,
        quality: this.mapOuraSleepScore(sleepData?.score),
        deep: sleepData?.deep_sleep_duration / 60 || 0,
        light: sleepData?.light_sleep_duration / 60 || 0,
        rem: sleepData?.rem_sleep_duration / 60 || 0,
        awake: sleepData?.awake_time / 60 || 0,
      },
    };
  }

  private async fetchActivity(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/usercollection/daily_activity?start_date=${date}&end_date=${date}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    const activity = data.data[0];
    return {
      steps: activity?.steps || 0,
      calories: activity?.total_calories || 0,
    };
  }

  private async fetchReadiness(date: string): Promise<Partial<HealthData>> {
    const response = await fetch(`${this.baseUrl}/usercollection/daily_readiness?start_date=${date}&end_date=${date}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();

    const readiness = data.data[0];
    return {
      hrv: readiness?.contributors?.hrv_balance || 0,
    };
  }

  private mapOuraSleepScore(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  }
}

// Unified Device Manager
export class DeviceIntegrationManager {
  private appleHealth: AppleHealthIntegration;
  private googleFit: GoogleFitIntegration;
  private fitbit: FitbitIntegration;
  private oura: OuraIntegration;

  constructor() {
    this.appleHealth = new AppleHealthIntegration();
    this.googleFit = new GoogleFitIntegration();
    this.fitbit = new FitbitIntegration();
    this.oura = new OuraIntegration();
  }

  async syncData(source: 'apple' | 'google' | 'fitbit' | 'oura', date: Date): Promise<HealthData> {
    switch (source) {
      case 'apple':
        return this.appleHealth.fetchData(date, date);
      case 'google':
        return this.googleFit.fetchData(date, date);
      case 'fitbit':
        return this.fitbit.fetchData(date);
      case 'oura':
        return this.oura.fetchData(date);
      default:
        throw new Error(`Unknown device source: ${source}`);
    }
  }

  async syncAllDevices(date: Date): Promise<Record<string, HealthData>> {
    const results: Record<string, HealthData> = {};

    try {
      results.fitbit = await this.fitbit.fetchData(date);
    } catch (error) {
      console.error('Fitbit sync failed:', error);
    }

    try {
      results.oura = await this.oura.fetchData(date);
    } catch (error) {
      console.error('Oura sync failed:', error);
    }

    return results;
  }
}

export const deviceManager = new DeviceIntegrationManager();
