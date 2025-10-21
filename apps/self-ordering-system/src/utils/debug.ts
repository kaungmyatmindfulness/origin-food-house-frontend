/**
 * Debug utility for conditional logging based on environment.
 * Logs are only shown in development mode.
 */

const isDev = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
