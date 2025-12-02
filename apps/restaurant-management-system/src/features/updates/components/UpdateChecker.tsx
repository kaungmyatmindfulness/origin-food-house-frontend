'use client';

/**
 * UpdateChecker component for Tauri desktop apps.
 * Checks for updates on app start and periodically, showing a dialog when available.
 * Only renders in Tauri environment (not in web browser).
 */

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Progress } from '@repo/ui/components/progress';

import { isDesktop, isTauri } from '@/utils/platform';

interface UpdateInfo {
  version: string;
  currentVersion: string;
  body: string | null;
  downloadAndInstall: (
    onProgress: (event: ProgressEvent) => void
  ) => Promise<void>;
}

interface ProgressEvent {
  event: 'Started' | 'Progress' | 'Finished';
  data: {
    chunkLength?: number;
    contentLength?: number;
  };
}

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function UpdateChecker() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    // Only check for updates in Tauri desktop environment
    if (!isTauri() || !isDesktop()) {
      return;
    }

    try {
      // Dynamic import to avoid errors in non-Tauri environments
      const { check } = await import('@tauri-apps/plugin-updater');
      const available = await check();

      if (available) {
        setUpdate(available as unknown as UpdateInfo);
      }
    } catch (err) {
      // Silently fail - updates are not critical
      console.warn('Failed to check for updates:', err);
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkForUpdates();

    // Periodic checks
    const interval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [checkForUpdates]);

  const handleUpdate = async () => {
    if (!update) return;

    setDownloading(true);
    setError(null);

    try {
      await update.downloadAndInstall((event: ProgressEvent) => {
        if (event.event === 'Started' && event.data.contentLength) {
          setTotalSize(event.data.contentLength);
        } else if (event.event === 'Progress' && event.data.chunkLength) {
          setProgress((prev) => prev + event.data.chunkLength!);
        }
      });

      // Relaunch the app after update is installed
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
      setDownloading(false);
    }
  };

  const handleDismiss = () => {
    setUpdate(null);
    setError(null);
    setProgress(0);
    setTotalSize(0);
  };

  // Don't render anything if no update or not in Tauri
  if (!update) {
    return null;
  }

  const progressPercent = totalSize > 0 ? (progress / totalSize) * 100 : 0;

  return (
    <Dialog open={!!update} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Available</DialogTitle>
          <DialogDescription>
            Version {update.version} is available. You are currently on version{' '}
            {update.currentVersion}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {update.body && (
            <div className="bg-muted rounded-md p-3">
              <h4 className="mb-2 font-medium">Release Notes</h4>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {update.body}
              </p>
            </div>
          )}

          {downloading && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-muted-foreground text-center text-sm">
                {totalSize > 0
                  ? `Downloading... ${Math.round(progressPercent)}%`
                  : 'Preparing download...'}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {!downloading && (
            <>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="w-full sm:w-auto"
              >
                Later
              </Button>
              <Button onClick={handleUpdate} className="w-full sm:w-auto">
                Update Now
              </Button>
            </>
          )}
          {downloading && (
            <p className="text-muted-foreground w-full text-center text-sm">
              Please wait while the update is being installed...
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
