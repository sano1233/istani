/**
 * Internationalization (i18n) System
 * Multi-language support with locale-aware formatting
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'zh' | 'ar' | 'hi';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, flag: '🇮🇳' },
];

export interface Translations {
  common: Record<string, string>;
  navigation: Record<string, string>;
  dashboard: Record<string, string>;
  workouts: Record<string, string>;
  nutrition: Record<string, string>;
  profile: Record<string, string>;
  settings: Record<string, string>;
  auth: Record<string, string>;
  errors: Record<string, string>;
}

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Map<SupportedLanguage, Translations> = new Map();
  private fallbackLanguage: SupportedLanguage = 'en';

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectLanguage();
    }
  }

  /**
   * Detect user's preferred language
   */
  private detectLanguage(): void {
    // Check localStorage
    const storedLang = localStorage.getItem('language') as SupportedLanguage;
    if (storedLang && this.isSupported(storedLang)) {
      this.currentLanguage = storedLang;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (this.isSupported(browserLang)) {
      this.currentLanguage = browserLang;
      return;
    }

    // Default to English
    this.currentLanguage = 'en';
  }

  /**
   * Check if language is supported
   */
  private isSupported(lang: string): boolean {
    return SUPPORTED_LANGUAGES.some((l) => l.code === lang);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (!this.isSupported(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return;
    }

    this.currentLanguage = lang;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;

      // Set RTL if needed
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      if (langConfig?.rtl) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }

    // Load translations if not already loaded
    if (!this.translations.has(lang)) {
      await this.loadTranslations(lang);
    }
  }

  /**
   * Load translations for a language
   */
  async loadTranslations(lang: SupportedLanguage): Promise<void> {
    try {
      // In production, these would be loaded from separate JSON files
      const response = await fetch(`/locales/${lang}.json`);
      if (response.ok) {
        const translations = await response.json();
        this.translations.set(lang, translations);
      } else {
        console.warn(`Failed to load translations for ${lang}`);
      }
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
    }
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, string | number>): string {
    const translations = this.translations.get(this.currentLanguage);

    // Parse nested keys (e.g., "common.hello")
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    // Fallback to English if not found
    if (value === undefined && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage);
      let fallbackValue: any = fallbackTranslations;
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
        if (fallbackValue === undefined) break;
      }
      value = fallbackValue;
    }

    // If still not found, return the key
    if (value === undefined) {
      return key;
    }

    // Replace parameters
    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (_, key) => {
        return params[key]?.toString() || `{${key}}`;
      });
    }

    return value;
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLanguage);

    return new Intl.DateTimeFormat(langConfig?.code || 'en', options).format(dateObj);
  }

  /**
   * Format number according to locale
   */
  formatNumber(
    num: number,
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(
    amount: number,
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) {
      return this.t('common.justNow');
    } else if (diffMin < 60) {
      return this.t('common.minutesAgo', { count: diffMin });
    } else if (diffHr < 24) {
      return this.t('common.hoursAgo', { count: diffHr });
    } else if (diffDay < 7) {
      return this.t('common.daysAgo', { count: diffDay });
    } else {
      return this.formatDate(dateObj, { dateStyle: 'medium' });
    }
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(lang?: SupportedLanguage): LanguageConfig | undefined {
    return SUPPORTED_LANGUAGES.find((l) => l.code === (lang || this.currentLanguage));
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Pluralize based on count
   */
  plural(key: string, count: number, params?: Record<string, string | number>): string {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.t(pluralKey, { ...params, count });
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    const langConfig = this.getLanguageConfig();
    return langConfig?.rtl || false;
  }
}

// Singleton instance
export const i18n = new I18nService();

/**
 * React hook for translations
 */
export function useTranslation() {
  return {
    t: (key: string, params?: Record<string, string | number>) => i18n.t(key, params),
    language: i18n.getCurrentLanguage(),
    setLanguage: (lang: SupportedLanguage) => i18n.setLanguage(lang),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      i18n.formatDate(date, options),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) =>
      i18n.formatNumber(num, options),
    formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) =>
      i18n.formatCurrency(amount, currency, options),
    formatRelativeTime: (date: Date | string) => i18n.formatRelativeTime(date),
    isRTL: () => i18n.isRTL(),
  };
}

export default i18n;
