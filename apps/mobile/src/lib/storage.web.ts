/**
 * Web-only storage implementation using localStorage.
 * Metro automatically selects this file over storage.ts on web.
 * expo-secure-store is never imported or bundled for web.
 */

async function getItem(key: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

async function deleteItem(key: string): Promise<void> {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export const storage = { getItem, setItem, deleteItem };
