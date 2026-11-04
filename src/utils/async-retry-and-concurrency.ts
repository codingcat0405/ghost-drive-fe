/**
 * Small async helpers used by chunked upload/download:
 * - retryWithBackoff: retry flaky network ops (mobile networks drop requests often)
 * - runWithConcurrency: process N items with a bounded number of parallel workers
 * - fetchWithRetry: fetch that retries on network errors / 5xx / 429
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class NonRetryableError extends Error {}

/** Axios errors with a 4xx response (except 429) will never succeed on retry */
const isRetryable = (error: unknown): boolean => {
  if (error instanceof NonRetryableError) return false;
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === undefined || status >= 500 || status === 429;
};

export const retryWithBackoff = async <T>(
  task: (attempt: number) => Promise<T>,
  { retries = 3, baseDelayMs = 1000 }: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === retries) break;
      // Exponential backoff with jitter: 1s, 2s, 4s (+ up to 30%)
      const delay = baseDelayMs * 2 ** attempt;
      await sleep(delay + Math.random() * delay * 0.3);
    }
  }
  throw lastError;
};

const assertOk = (response: Response, label: string) => {
  if (response.ok) return;
  const message = `${label} failed: ${response.status} ${response.statusText}`;
  if (response.status >= 500 || response.status === 429) throw new Error(message);
  throw new NonRetryableError(message);
};

/** fetch + retry. Non-2xx client errors (except 429) are not retried. */
export const fetchWithRetry = (url: string, init: RequestInit, label: string): Promise<Response> =>
  retryWithBackoff(async () => {
    const response = await fetch(url, init);
    assertOk(response, label);
    return response;
  });

/** Like fetchWithRetry but also retries when the body stream breaks mid-transfer */
export const fetchArrayBufferWithRetry = (url: string, init: RequestInit, label: string): Promise<ArrayBuffer> =>
  retryWithBackoff(async () => {
    const response = await fetch(url, init);
    assertOk(response, label);
    return response.arrayBuffer();
  });

/**
 * Run `worker(item)` for every index in [0, count) with at most `concurrency` in flight.
 * Rejects on the first failure; remaining queued items are not started.
 */
export const runWithConcurrency = async (
  count: number,
  concurrency: number,
  worker: (index: number, slot: number) => Promise<void>
): Promise<void> => {
  let next = 0;
  let failed = false;
  const lanes = Array.from({ length: Math.min(concurrency, count) }, async (_, slot) => {
    while (!failed && next < count) {
      const index = next++;
      try {
        await worker(index, slot);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  });
  await Promise.all(lanes);
};

/** Mobile devices have far less memory per tab → fewer chunks (25MB each) in flight */
export const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const getChunkConcurrency = (): number => (isMobileDevice() ? 2 : 4);
