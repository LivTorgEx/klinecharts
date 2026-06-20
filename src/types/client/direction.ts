export const PositionDirection = {
  LONG: "LONG",
  SHORT: "SHORT",
  BOTH: "BOTH",
} as const;

export type PositionDirection =
  (typeof PositionDirection)[keyof typeof PositionDirection];

const POSITION_DIRECTION_LOOKUP: Record<string, PositionDirection> = {
  LONG: PositionDirection.LONG,
  SHORT: PositionDirection.SHORT,
  BOTH: PositionDirection.BOTH,
};

export function isPositionDirection(
  value: unknown
): value is PositionDirection {
  return (
    typeof value === "string" &&
    POSITION_DIRECTION_LOOKUP[value.toUpperCase()] !== undefined
  );
}

export function normalizePositionDirection(
  value: unknown
): PositionDirection | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return POSITION_DIRECTION_LOOKUP[value.toUpperCase()];
}

export const OrderSide = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide];

const ORDER_SIDE_LOOKUP: Record<string, OrderSide> = {
  BUY: OrderSide.BUY,
  SELL: OrderSide.SELL,
};

export function isOrderSide(value: unknown): value is OrderSide {
  return (
    typeof value === "string" &&
    ORDER_SIDE_LOOKUP[value.toUpperCase()] !== undefined
  );
}

export function normalizeOrderSide(value: unknown): OrderSide | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return ORDER_SIDE_LOOKUP[value.toUpperCase()];
}
