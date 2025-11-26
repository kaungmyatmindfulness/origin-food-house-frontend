'use client';

/**
 * Client-side IntlProvider for SSG/static export.
 * Wraps NextIntlClientProvider with Zustand-based locale management.
 * Handles dynamic message loading and provides a loading skeleton.
 */
import { useState, useEffect, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import {
  useLocaleStore,
  selectLocale,
  selectIsInitialized,
} from './locale.store';
import { loadMessages, preloadAllMessages } from './messages';

/**
 * Loading skeleton shown while locale and messages initialize.
 */
function LoadingSkeleton() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const locale = useLocaleStore(selectLocale);
  const isInitialized = useLocaleStore(selectIsInitialized);
  const initialize = useLocaleStore((state) => state.initialize);

  const [messages, setMessages] = useState<Record<string, unknown> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load messages when locale changes
  useEffect(() => {
    if (!isInitialized) return;

    let cancelled = false;
    setIsLoading(true);

    loadMessages(locale)
      .then((loadedMessages) => {
        if (!cancelled) {
          setMessages(loadedMessages);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        // Fallback to English on error
        if (!cancelled && locale !== 'en') {
          loadMessages('en')
            .then((fallbackMessages) => {
              if (!cancelled) {
                setMessages(fallbackMessages);
                setIsLoading(false);
              }
            })
            .catch(() => {
              if (!cancelled) {
                setIsLoading(false);
              }
            });
        } else if (!cancelled) {
          setIsLoading(false);
        }
      });

    // Preload all locales in background for offline support and instant switching
    preloadAllMessages();

    return () => {
      cancelled = true;
    };
  }, [locale, isInitialized]);

  // Show loading skeleton while initializing
  if (!isInitialized || isLoading || !messages) {
    return <LoadingSkeleton />;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
