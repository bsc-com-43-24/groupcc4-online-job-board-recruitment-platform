'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * `true` once React has hydrated on the client, `false` during server render.
 *
 * Used to delay "not found" states until the browser store has been read, so a
 * record created in this browser never flashes a 404 on first paint.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
