import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { PositionOrder } from "../types/client/order";
import { PositionInfoModal } from "./PositionInfoModal";

export const NOTE_MODAL_EVENT = "klinechart:note-selected";

export type NoteModalEventDetail = {
  order: PositionOrder;
};

type OpenModal = {
  id: string;
  order: PositionOrder;
  x: number;
  y: number;
};

export function PositionInfoModalsContainer() {
  const [modals, setModals] = useState<OpenModal[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { order } = (e as CustomEvent<NoteModalEventDetail>).detail;
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
    };

    window.addEventListener(NOTE_MODAL_EVENT, handler);
    return () => window.removeEventListener(NOTE_MODAL_EVENT, handler);
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
