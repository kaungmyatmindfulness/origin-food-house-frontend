/**
 * Client-side locale store for SSG/static export.
 * Replaces server-side middleware locale detection.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { locales, defaultLocale, type Locale } from './config';

interface LocaleState {
  locale: Locale;
  isInitialized: boolean;
}

interface LocaleActions {
  setLocale: (locale: Locale) => void;
  initialize: () => void;
}

export const useLocaleStore = create<LocaleState & LocaleActions>()(
  persist(
    (set, get) => ({
      locale: defaultLocale,
      isInitialized: false,

      setLocale: (locale) => {
        if (locales.includes(locale)) {
          set({ locale });
          if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
          }
        }
      },

      initialize: () => {
        if (get().isInitialized) return;

        // The persist middleware has already rehydrated the locale from localStorage
        const storedLocale = get().locale;
        if (storedLocale && locales.includes(storedLocale)) {
          if (typeof document !== 'undefined') {
            document.documentElement.lang = storedLocale;
          }
          set({ isInitialized: true });
          return;
        }

        // Browser language detection as fallback
        if (typeof navigator !== 'undefined') {
          const browserLang = navigator.language.split('-')[0] as Locale;
          const finalLocale = locales.includes(browserLang)
            ? browserLang
            : defaultLocale;
          set({ locale: finalLocale, isInitialized: true });
          document.documentElement.lang = finalLocale;
          return;
        }

        // Default fallback
        set({ isInitialized: true });
      },
    }),
    {
      name: 'rms-locale',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

// Selectors for optimal re-render performance
export const selectLocale = (state: LocaleState) => state.locale;
export const selectIsInitialized = (state: LocaleState) => state.isInitialized;
