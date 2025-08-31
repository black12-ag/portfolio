import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wishlist';
const UPDATE_EVENT = 'wishlist:updated';

function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (error) {
    console.warn('Failed to read wishlist:', error);
    return [];
  }
}

function writeWishlist(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  } catch (error) {
    console.warn('Failed to write wishlist:', error);
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => readWishlist());

  // Keep in sync across tabs/parts of app
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setWishlist(readWishlist());
    };
    const onCustom = () => setWishlist(readWishlist());
    window.addEventListener('storage', onStorage);
    window.addEventListener(UPDATE_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(UPDATE_EVENT, onCustom as EventListener);
    };
  }, []);

  const count = wishlist.length;

  const inWishlist = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const toggle = useCallback((id: string) => {
    const current = readWishlist();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : Array.from(new Set([...current, id]));
    writeWishlist(next);
    setWishlist(next);
    return next.includes(id);
  }, []);

  const set = useCallback((id: string, value: boolean) => {
    const current = readWishlist();
    const next = value
      ? Array.from(new Set([...current, id]))
      : current.filter((x) => x !== id);
    writeWishlist(next);
    setWishlist(next);
  }, []);

  return useMemo(
    () => ({ wishlist, count, inWishlist, toggle, set }),
    [wishlist, count, inWishlist, toggle, set]
  );
}


