// Global DOM event type declarations for custom alert overlay events
// dispatched by the "alert" klinecharts overlay.

interface AlertDraggedEventDetail {
  alertId: string;
  oldPrice: number;
  newPrice: number;
}

interface AlertDeleteEventDetail {
  alertId: string;
}

declare global {
  interface WindowEventMap {
    "user-alert-dragged": CustomEvent<AlertDraggedEventDetail>;
    "user-alert-delete": CustomEvent<AlertDeleteEventDetail>;
  }
}

export {};
