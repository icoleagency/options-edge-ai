import { useEffect, useState } from "react";

/** Hydration-safe localStorage-backed state. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch { /* ignore corrupt storage */ }
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);
  return [value, setValue] as const;
}
