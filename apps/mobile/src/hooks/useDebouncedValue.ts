import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after it has stopped changing for
 * `delayMs`. Used to debounce the radius before it drives a geo-window refetch,
 * so dragging the stepper doesn't fire a request per step.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
