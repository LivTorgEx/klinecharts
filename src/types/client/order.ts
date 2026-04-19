export type PositionOrder = {
  id?: number | string;
  price: number;
  qty: number;
  side: "buy" | "sell" | string;
  created_at?: string;
  order_type?: string;
  stop_price?: number;
  update_at?: string;
  client_id?: number | string;
  original_id?: number | string;
  notes?: Array<{ [property: string]: string | number | boolean }>;
  status?: string;
  qty_filled?: number;
};

export type PositionOrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_MARKET"
  | "STOP_LIMIT"
  | string;

export const PositionOrderType = {
  Market: "MARKET",
  Limit: "LIMIT",
  StopMarket: "STOP_MARKET",
  StopLimit: "STOP_LIMIT",
} as const;

export const OrderDirection = {
  LONG: "LONG",
  SHORT: "SHORT",
  BOTH: "BOTH",
} as const;

export type OrderDirection =
  (typeof OrderDirection)[keyof typeof OrderDirection];
