export type MarketDecisionCandle = {
  min: number;
  max: number;
  enter: number;
  exit: number;
  qty: number;
  asset: number;
  qtym: number;
  masset: number;
};

export type MarketDecisionOrderBookLevel = {
  price: number;
  quantity: number;
  total_amount: number;
  filled: number | null;
  time_start: number;
  duration: number;
};

export type MarketDecision = {
  time: number;
  system_time: number;
  symbol_key: string;
  price: number;
  candle: MarketDecisionCandle;
  fc: MarketDecisionCandle | null;
  ntp_5s: number;
  tdt: number | null;
  order_book: {
    asks: MarketDecisionOrderBookLevel[];
    bids: MarketDecisionOrderBookLevel[];
    ask_amount: number;
    ask_price: number | null;
    bid_amount: number;
    bid_price: number | null;
  } | null;
  oi: {
    usd: number;
    change: number;
    change_qty: number;
    avg: number;
  } | null;
};
