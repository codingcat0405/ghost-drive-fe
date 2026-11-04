/**
 * Pool of crypto Web Workers. Every task carries a unique id so several tasks can be
 * in flight on the same worker without overwriting each other's `onmessage` handler.
 */

type CryptoCommand = 'encrypt' | 'decrypt';

type PendingTask = { resolve: (data: ArrayBuffer) => void; reject: (error: Error) => void };

export interface CryptoWorkerPool {
  /** Encrypt/decrypt one chunk on worker `slot` (transfers `chunkData` ownership) */
  run: (slot: number, command: CryptoCommand, chunkData: ArrayBuffer, aesKeyBase64: string) => Promise<ArrayBuffer>;
  terminate: () => void;
}

export const createCryptoWorkerPool = (size: number): CryptoWorkerPool => {
  const pending = new Map<number, PendingTask>();
  let nextTaskId = 0;

  const workers = Array.from({ length: Math.max(1, size) }, () => {
    const worker = new Worker(new URL('./crypto-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent) => {
      const { taskId, success, data, error } = event.data;
      const task = pending.get(taskId);
      if (!task) return;
      pending.delete(taskId);
      if (success) task.resolve(data);
      else task.reject(new Error(error));
    };
    worker.onerror = (event) => {
      // A crashed worker cannot answer: fail everything still pending
      const error = new Error(`Crypto worker error: ${event.message}`);
      pending.forEach((task) => task.reject(error));
      pending.clear();
    };
    return worker;
  });

  return {
    run: (slot, command, chunkData, aesKeyBase64) =>
      new Promise((resolve, reject) => {
        const taskId = nextTaskId++;
        pending.set(taskId, { resolve, reject });
        workers[slot % workers.length].postMessage({ taskId, command, chunkData, aesKeyBase64 }, [chunkData]);
      }),
    terminate: () => {
      workers.forEach((w) => w.terminate());
      pending.forEach((task) => task.reject(new Error('Crypto worker pool terminated')));
      pending.clear();
    },
  };
};
