/**
 * Native storage implementation using expo-secure-store.
 * On web, Metro resolves to storage.web.ts instead of this file.
 * Static import here — no dynamic imports — so the web bundle never
 * includes expo-secure-store.
 */
import * as SecureStore from 'expo-secure-store';

async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  return SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  return SecureStore.deleteItemAsync(key);
}

export const storage = { getItem, setItem, deleteItem };
