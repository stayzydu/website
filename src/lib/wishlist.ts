const KEY = "heystay_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const exists = list.includes(id);
  const next = exists ? list.filter(x => x !== id) : [...list, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return !exists;
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}
