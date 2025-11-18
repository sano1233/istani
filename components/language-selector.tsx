'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, i18n } from '@/lib/i18n';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(i18n.getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);

    // Force re-render of the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="text-lg">{currentLangConfig?.flag}</span>
        <span className="hidden sm:inline">{currentLangConfig?.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-sm font-medium text-muted-foreground px-2 py-1 mb-1">
                Select Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                    currentLang === lang.code ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                  {currentLang === lang.code && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
