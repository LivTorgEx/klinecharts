import { useRef } from "react";
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

export function PositionInfoModal({
  order,
  initialX = 80,
  initialY = 80,
  onClose,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const side = order.qty > 0 ? "Buy" : "Sell";
  const price = order.price || order.stop_price || 0;
  const amount = Math.abs(order.qty) * price;
  const rows: Array<[string, string | number]> = [
    ["Price", price],
    ...(order.position_side ? [["Position side", order.position_side] as [string, string]] : []),
    ...(order.stop_price && order.stop_price !== order.price ? [["Stop price", order.stop_price] as [string, number]] : []),
    ["Quantity", formatBigNumber(Math.abs(order.qty), "")],
    ...(order.qty_filled !== undefined ? [["Filled quantity", formatBigNumber(order.qty_filled, "")] as [string, string]] : []),
    ["Amount", `${formatBigNumber(amount, "")} $`],
    ...(order.realized_pnl != null ? [["Realized PnL", `${formatBigNumber(order.realized_pnl, "")} $`] as [string, string]] : []),
    ...(order.fee != null ? [["Fee", `${formatBigNumber(order.fee, "")} $`] as [string, string]] : []),
    ...(order.status ? [["Status", order.status] as [string, string]] : []),
    ...(order.update_at !== undefined ? [["Time", formatChartDate(order.update_at)] as [string, string]] : []),
    ...(order.original_id ? [["Order ID", String(order.original_id)] as [string, string]] : []),
    ...(order.client_id ? [["Client ID", String(order.client_id)] as [string, string]] : []),
  ];

  return (
    <div
      ref={nodeRef}
      style={{ left: initialX, top: initialY }}
      className="fixed z-[9999] min-w-[300px] max-w-[min(600px,calc(100vw-24px))] overflow-hidden rounded-xl border border-gray-700 bg-gray-950 text-white shadow-2xl"
    >
        <div className={`position-info-modal-handle flex cursor-grab items-center justify-between px-3 py-2 active:cursor-grabbing ${order.qty > 0 ? "bg-emerald-800" : "bg-rose-800"}`}>
          <div className="flex items-baseline gap-2">
            <Text variant="body-sm" weight="bold">{side}</Text>
            <Text variant="caption" tone="muted">{order.order_type}</Text>
          </div>
          <Button type="button" variant="icon" size="sm" aria-label="Close order details" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <dl className="position-info-modal-content grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-3 py-2 text-xs">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="whitespace-nowrap text-gray-400">{label}</dt>
              <dd className="break-all font-medium">{value}</dd>
            </div>
          ))}
          {order.note ? <><dt className="text-gray-400">Note</dt><dd className="break-words">{order.note}</dd></> : null}
          {order.mark ? <><dt className="text-gray-400">Mark</dt><dd>{order.mark}</dd></> : null}
        </dl>
    </div>
  );
}
