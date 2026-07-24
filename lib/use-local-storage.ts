import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function getSnapshot<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : initial;
}

export function useLocalStorage<T>(key: string, initial: T): T {
  return useSyncExternalStore(
    emptySubscribe,
    () => getSnapshot(key, initial),
    () => initial
  );
}
