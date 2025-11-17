import { useEffect } from 'react';

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    enabled?: boolean;
  } = {}
): void {
  const { ctrl = false, meta = false, shift = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Check if the key matches
      const keyMatches = e.key.toLowerCase() === key.toLowerCase();

      // Check modifiers
      const ctrlMatches = ctrl
        ? e.ctrlKey || e.metaKey
        : !e.ctrlKey && !e.metaKey;
      const shiftMatches = shift ? e.shiftKey : !e.shiftKey;

      if (keyMatches && ctrlMatches && shiftMatches) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrl, meta, shift, enabled]);
}
