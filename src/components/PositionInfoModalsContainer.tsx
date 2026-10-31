import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { PositionOrder } from "../types/client/order";
import { PositionInfoModal } from "./PositionInfoModal";

export const NOTE_MODAL_EVENT = "klinechart:note-selected";

export type NoteModalEventDetail = {
  order: PositionOrder;
};

type NoteModalHandler = (order: PositionOrder) => void;

const noteModalHandlers = new Set<NoteModalHandler>();
let noteModalEventListenerAttached = false;

const handleNoteModalEvent = (event: Event) => {
  // Each chart mounts a container, so route the global event to only one host.
  const handler = noteModalHandlers.values().next().value;
  if (!handler) {
    return;
  }

  const { order } = (event as CustomEvent<NoteModalEventDetail>).detail;
  handler(order);
};

function subscribeToNoteModalEvents(handler: NoteModalHandler) {
  noteModalHandlers.add(handler);

  if (!noteModalEventListenerAttached) {
    window.addEventListener(NOTE_MODAL_EVENT, handleNoteModalEvent);
    noteModalEventListenerAttached = true;
  }

  return () => {
    noteModalHandlers.delete(handler);
    if (noteModalHandlers.size === 0 && noteModalEventListenerAttached) {
      window.removeEventListener(NOTE_MODAL_EVENT, handleNoteModalEvent);
      noteModalEventListenerAttached = false;
    }
  };
}

type OpenModal = {
  id: string;
  order: PositionOrder;
  x: number;
  y: number;
};

export function PositionInfoModalsContainer() {
  const [modals, setModals] = useState<OpenModal[]>([]);

  useEffect(() => {
    return subscribeToNoteModalEvents((order) => {
      const id = `note-modal-${order.id ?? Math.random()}`;
      setModals((prev) => {
        // If already open for same order id, bring to front by moving to end
        const exists = prev.findIndex((m) => m.id === id);
        if (exists !== -1) {
          const updated = [...prev];
          updated.splice(exists, 1);
          return [
            ...updated,
            {
              id,
              order,
              x: 80 + updated.length * 24,
              y: 80 + updated.length * 24,
            },
          ];
        }
        return [
          ...prev,
          { id, order, x: 80 + prev.length * 24, y: 80 + prev.length * 24 },
        ];
      });
    });
  }, []);

  const close = (id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  };

  if (modals.length === 0) return null;

  return createPortal(
    <>
      {modals.map((m) => (
        <PositionInfoModal
          key={m.id}
          order={m.order}
          initialX={m.x}
          initialY={m.y}
          onClose={() => close(m.id)}
        />
      ))}
    </>,
    document.body
  );
}
