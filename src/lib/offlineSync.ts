import logger from './logger';

type PendingMutation = {
  id: string;
  entity: 'booking' | 'room' | 'expense' | 'payment';
  operation: 'create' | 'update' | 'delete' | 'checkin' | 'checkout';
  payload: unknown;
  createdAt: number;
};

const STORAGE_KEY = 'metah-offline-queue';

function loadQueue(): PendingMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingMutation[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingMutation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt'>) {
  const q = loadQueue();
  q.push({ ...mutation, id: crypto.randomUUID(), createdAt: Date.now() });
  saveQueue(q);
  logger.info('offline', 'Queued mutation', mutation.entity, mutation.operation);
}

export async function flushQueue(syncer: (m: PendingMutation) => Promise<void>) {
  const q = loadQueue();
  if (q.length === 0) return;
  logger.info('offline', `Flushing ${q.length} queued mutations`);
  const remaining: PendingMutation[] = [];
  for (const m of q) {
    try {
      await syncer(m);
    } catch (e) {
      logger.warn('offline', 'Failed to sync mutation, will retry later', m, e);
      remaining.push(m);
    }
  }
  saveQueue(remaining);
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function installConnectivityHandler(onOnline: () => void) {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', onOnline);
}


