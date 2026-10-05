import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const prefix = "versatilmaker3d:v1:";

/** Dados locais deste navegador; não substitui um banco compartilhado. */
export function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed as T : fallback;
    return typeof parsed === typeof fallback && parsed !== null ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredValue(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function usePersistentState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, fallback));
  useEffect(() => {
    if (!writeStoredValue(key, value)) {
      window.dispatchEvent(new Event("versatilmaker:storage-error"));
    }
  }, [key, value]);
  return [value, setValue];
}
