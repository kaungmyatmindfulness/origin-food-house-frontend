declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const analytics = {
  init: () => {
    if (typeof window === 'undefined') return;

    const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
    if (!GA4_ID) {
      // Analytics not configured - silently skip in development
      return;
    }

    // GA4 initialization would go here
    // Load gtag.js script and initialize tracking
  },

  trackPageView: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_ID!, {
        page_path: url,
      });
    }
  },

  trackEvent: (name: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, params);
    }
  },

  trackDemoRequest: (email: string) => {
    analytics.trackEvent('demo_request', {
      category: 'Lead Generation',
      label: email,
    });
  },
};
