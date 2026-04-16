import { PositionOrder } from "../../types/client/order";

type BotPositionFilter = {
  bot_id?: number;
  status?: string[];
  order_status?: string[];
};

type BotPositionItem = {
  id: number | string;
  orders: PositionOrder[];
  side: string;
  total_profit: number;
  fee: number;
  created_at: string;
  entry_price: number;
  qty: number;
};

type BotPositionsResult = {
  data: BotPositionItem[];
};

export function useBotPositions(_filter?: BotPositionFilter) {
  return {
    data: undefined as BotPositionsResult | undefined,
    isLoading: false,
  };
}
