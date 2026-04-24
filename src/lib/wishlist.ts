const WISHLIST_KEY = 'velotech:wishlist';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function readWishlistIds(): string[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeWishlistIds(ids: string[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function isInWishlist(productId: string): boolean {
  return readWishlistIds().includes(productId);
}

export function addToWishlist(productId: string) {
  writeWishlistIds([...readWishlistIds(), productId]);
}

export function removeFromWishlist(productId: string) {
  writeWishlistIds(readWishlistIds().filter((id) => id !== productId));
}

export function toggleWishlist(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  }

  addToWishlist(productId);
  return true;
}
