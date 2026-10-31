import { useRef, useState, type PointerEvent } from "react";
import { Button, Text } from "@livtorgex/ui-kit";
import { X } from "lucide-react";
import type { PositionOrder } from "../types/client/order";
import { formatChartDate } from "../utils/date";
import { formatBigNumber } from "../utils/number";

type Props = {
  order: PositionOrder;
  initialX?: number;
  initialY?: number;
  onClose: () => void;
};

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

function formatMoney(value: number) {
  return `${formatBigNumber(value, "") || "0"} $`;
}

export function PositionInfoModal({
  order,
  initialX = 80,
  initialY = 80,
  onClose,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const side = order.qty > 0 ? "Buy" : "Sell";
  const price = order.price || order.stop_price || 0;
  const amount = Math.abs(order.qty) * price;
  const orderType = order.order_type
    ? order.order_type
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Order";
  const rows: Array<[string, string | number]> = [
    ["Type", orderType],
    ["Price", order.price > 0 ? order.price : "—"],
    [
      "Stop price",
      order.stop_price != null && order.stop_price > 0 ? order.stop_price : "—",
    ],
    ...(order.position_side
      ? [["Position side", order.position_side] as [string, string]]
      : []),
    ["Qty", formatBigNumber(Math.abs(order.qty), "")],
    ...(order.qty_filled !== undefined
      ? [
          ["Qty filled", formatBigNumber(order.qty_filled, "")] as [
            string,
            string,
          ],
        ]
      : []),
    ["Amount", formatMoney(amount)],
    ...(order.realized_pnl != null
      ? [["Realized PnL", formatMoney(order.realized_pnl)] as [string, string]]
      : []),
    ...(order.fee != null
      ? [["Fee", formatMoney(order.fee)] as [string, string]]
      : []),
    ...(order.status ? [["Status", order.status] as [string, string]] : []),
    ...(order.update_at !== undefined
      ? [["Time", formatChartDate(order.update_at)] as [string, string]]
      : []),
    ...(order.original_id
      ? [["Order ID", String(order.original_id)] as [string, string]]
      : []),
    ...(order.client_id
      ? [["Client ID", String(order.client_id)] as [string, string]]
      : []),
  ];

  const startDragging = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveModal = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const width = nodeRef.current?.offsetWidth ?? 300;
    const height = nodeRef.current?.offsetHeight ?? 200;
    setPosition({
      x: Math.max(
        0,
        Math.min(window.innerWidth - width, event.clientX - drag.offsetX)
      ),
      y: Math.max(
        0,
        Math.min(window.innerHeight - height, event.clientY - drag.offsetY)
      ),
    });
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = undefined;
    }
  };

  return (
    <div
      ref={nodeRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-[9999] w-[min(420px,calc(100vw-24px))] max-h-[min(80vh,560px)] overflow-hidden rounded-xl border border-gray-700 bg-gray-950 text-white shadow-2xl"
    >
      <div
        className={`position-info-modal-handle flex touch-none select-none cursor-grab items-center justify-between px-2 py-1 active:cursor-grabbing ${order.qty > 0 ? "bg-emerald-800" : "bg-rose-800"}`}
        onPointerDown={startDragging}
        onPointerMove={moveModal}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <div className="flex items-baseline gap-2">
          <Text variant="body-sm" weight="bold">
            {side}
          </Text>
        </div>
        <Button
          type="button"
          variant="icon"
          size="xs"
          aria-label="Close order details"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <dl className="position-info-modal-content grid max-h-[min(60vh,480px)] grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 overflow-y-auto px-2 py-1.5 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="whitespace-nowrap text-gray-400">{label}</dt>
            <dd className="min-w-0 break-all font-medium">{value}</dd>
          </div>
        ))}
        {order.note ? (
          <>
            <dt className="text-gray-400">Notes</dt>
            <dd className="min-w-0 whitespace-pre-wrap break-all">
              {order.note}
            </dd>
          </>
        ) : null}
        {order.mark ? (
          <>
            <dt className="text-gray-400">Mark</dt>
            <dd className="min-w-0 break-all">{order.mark}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
