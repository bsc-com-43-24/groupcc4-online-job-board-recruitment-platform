/**
 * A tiny external store that plugs straight into `useSyncExternalStore`.
 *
 * Using this instead of React state keeps the app free of `setState` calls
 * inside effects (which the repo's lint config rejects) and gives every
 * consumer a stable snapshot, including during server rendering where a
 * separate "server snapshot" is required for hydration.
 */
export type ExternalStore<T> = {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createExternalStore<T>(initialValue: T): ExternalStore<T> {
  let value = initialValue;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next) => {
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T)(value) : next;

      if (Object.is(resolved, value)) {
        return;
      }

      value = resolved;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
