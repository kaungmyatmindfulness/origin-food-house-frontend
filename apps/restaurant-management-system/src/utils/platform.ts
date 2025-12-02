/**
 * Platform detection utilities for Tauri desktop/mobile integration.
 * Provides type-safe detection of Tauri environment and platform-specific helpers.
 */

/**
 * Check if the app is running inside a Tauri webview.
 * Works on both desktop (macOS, Windows, Linux) and mobile (Android, iOS).
 *
 * @returns true if running in Tauri, false if running in browser
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Get the appropriate Auth0 redirect URI based on platform.
 * Desktop/mobile apps use custom URL scheme (originfoodhouse://),
 * web apps use the standard HTTP redirect.
 *
 * @returns The Auth0 redirect URI for the current platform
 */
export function getAuth0RedirectUri(): string {
  if (isTauri()) {
    return (
      process.env['NEXT_PUBLIC_AUTH0_REDIRECT_URI_DESKTOP'] ??
      'originfoodhouse://auth/callback'
    );
  }
  return process.env['NEXT_PUBLIC_AUTH0_REDIRECT_URI'] ?? '';
}

/**
 * Get the appropriate Auth0 logout URL based on platform.
 *
 * @returns The Auth0 logout return URL for the current platform
 */
export function getAuth0LogoutUri(): string {
  if (isTauri()) {
    return (
      process.env['NEXT_PUBLIC_AUTH0_LOGOUT_URI_DESKTOP'] ??
      'originfoodhouse://'
    );
  }
  return process.env['NEXT_PUBLIC_AUTH0_LOGOUT_URI'] ?? '';
}

/**
 * Platform types supported by the app.
 */
export type Platform =
  | 'web'
  | 'desktop-macos'
  | 'desktop-windows'
  | 'desktop-linux'
  | 'mobile-android'
  | 'mobile-ios';

/**
 * Detect the current platform.
 * Useful for platform-specific UI adjustments or feature flags.
 *
 * @returns The detected platform
 */
export function getPlatform(): Platform {
  if (!isTauri()) {
    return 'web';
  }

  // In Tauri, we can detect OS from user agent or Tauri APIs
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'mobile-ios';
  }
  if (/Android/.test(userAgent)) {
    return 'mobile-android';
  }
  if (/Mac/.test(userAgent)) {
    return 'desktop-macos';
  }
  if (/Windows/.test(userAgent)) {
    return 'desktop-windows';
  }
  if (/Linux/.test(userAgent)) {
    return 'desktop-linux';
  }

  return 'web';
}

/**
 * Check if running on a desktop platform (not mobile or web).
 */
export function isDesktop(): boolean {
  const platform = getPlatform();
  return platform.startsWith('desktop-');
}

/**
 * Check if running on a mobile platform.
 */
export function isMobile(): boolean {
  const platform = getPlatform();
  return platform.startsWith('mobile-');
}
