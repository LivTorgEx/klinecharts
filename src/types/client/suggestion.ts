export type SuggestionInfoOrderBookLevel = {
  price: number;
  qty: number;
  quantity: number;
  total_amount: number;
  filled?: number;
};

export type SuggestionLineConsolidationMove = {
  time: number;
  price: number;
  title?: string;
  status: string;
  time_start: number;
  time_end: number;
  direction: "SHORT" | "LONG";
  price_min: number;
  price_max: number;
  activate_price: number;
  activate_price_changes: number[];
  rollback_price_changes: number[];
  break_price?: number;
  qtym: number;
  reason: string;
  rollbacks: number;
};
