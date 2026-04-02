export type PositionOrder = {
  id?: number | string;
  price: number;
  qty: number;
  side: 'buy' | 'sell' | string;
  created_at?: string;
};

export type PositionOrderType = 'MARKET' | 'LIMIT' | string;

export type OrderDirection = 'LONG' | 'SHORT' | string;
