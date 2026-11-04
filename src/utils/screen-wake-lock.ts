/**
 * Keep the screen on during long uploads/downloads. On mobile, a sleeping screen makes
 * Chrome throttle/freeze the tab and in-flight requests fail.
 * Returns a release function; no-op where the Wake Lock API is unsupported.
 */
export const acquireScreenWakeLock = async (): Promise<() => void> => {
  try {
    const sentinel = await navigator.wakeLock?.request('screen');
    return () => {
      sentinel?.release().catch(() => undefined);
    };
  } catch {
    // Denied (e.g. page hidden / battery saver) — continue without it
    return () => undefined;
  }
};
