export const PositionDirection = {
  LONG: "long",
  SHORT: "short",
  BOTH: "both",
} as const;

export type PositionDirection =
  (typeof PositionDirection)[keyof typeof PositionDirection];

export function isPositionDirection(
  value: unknown
): value is PositionDirection {
  return (
    value === PositionDirection.LONG ||
    value === PositionDirection.SHORT ||
    value === PositionDirection.BOTH
  );
}

export function normalizePositionDirection(
  value: unknown
): PositionDirection | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return isPositionDirection(value) ? value : undefined;
}

export const OrderSide = {
  BUY: "buy",
  SELL: "sell",
} as const;

export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide];

export function isOrderSide(value: unknown): value is OrderSide {
  return value === OrderSide.BUY || value === OrderSide.SELL;
}

export function normalizeOrderSide(value: unknown): OrderSide | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return isOrderSide(value) ? value : undefined;
}
