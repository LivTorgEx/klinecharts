import { useSyncExternalStore } from "react";

let pendingDrags = new Map<string, number>();
const subscribers = new Set<() => void>();

function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function getSnapshot() {
  return pendingDrags;
}

function notify() {
  subscribers.forEach((fn) => fn());
}

export function setPendingDrag(alertId: string, price: number) {
  pendingDrags = new Map(pendingDrags);
  pendingDrags.set(alertId, price);
  notify();
}

export function clearPendingDrag(alertId: string) {
  pendingDrags = new Map(pendingDrags);
  pendingDrags.delete(alertId);
  notify();
}

export function usePendingDrags() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
