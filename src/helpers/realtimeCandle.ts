import type { KLineData } from "klinecharts";

export type RealtimeCandleUpdate = {
  currentCandle: KLineData | null;
  flushedCandle?: KLineData;
  ignored: boolean;
};

type RealtimeTradeEvent = {
  symbol: string;
  price: number;
  quantity: number;
  was_buyer_maker: boolean;
  trade_time: number;
};

function cloneKLineData(data: KLineData): KLineData {
  return { ...data };
}

function roundToNearestDate(timestamp: number, interval: number): number {
  const seconds = timestamp / 1000;
  const roundedSeconds = Math.floor(seconds / interval) * interval;
  return roundedSeconds * 1000;
}

export function applyRealtimeTradeUpdate({
  currentCandle,
  trade,
  timeframe,
  symbolKey,
  lastBar,
}: {
  currentCandle: KLineData | null;
  trade: RealtimeTradeEvent;
  timeframe: number;
  symbolKey?: string;
  lastBar?: KLineData;
}): RealtimeCandleUpdate {
  if (trade.symbol !== symbolKey) {
    return {
      currentCandle,
      ignored: true,
    };
  }

  const roundTime = roundToNearestDate(trade.trade_time, timeframe);
  const latestTimestamp = currentCandle?.timestamp ?? lastBar?.timestamp;

  // Late trades should not rewrite an older candle. Only the active bar is
  // allowed to move.
  if (latestTimestamp !== undefined && roundTime < latestTimestamp) {
    return {
      currentCandle,
      ignored: true,
    };
  }

  if (!currentCandle || currentCandle.timestamp !== roundTime) {
    const base =
      lastBar?.timestamp === roundTime ? cloneKLineData(lastBar) : null;

    return {
      currentCandle: {
        timestamp: roundTime,
        open: base?.open ?? trade.price,
        close: trade.price,
        high: Math.max(base?.high ?? trade.price, trade.price),
        low: Math.min(base?.low ?? trade.price, trade.price),
        buy: (base?.buy ?? 0) + (trade.was_buyer_maker ? 0 : trade.quantity),
        sell: (base?.sell ?? 0) + (trade.was_buyer_maker ? trade.quantity : 0),
        volume: (base?.volume ?? 0) + trade.quantity,
      },
      flushedCandle: currentCandle ? cloneKLineData(currentCandle) : undefined,
      ignored: false,
    };
  }

  const nextCandle: KLineData = {
    ...currentCandle,
    close: trade.price,
    high: Math.max(currentCandle.high, trade.price),
    low: Math.min(currentCandle.low, trade.price),
  };

  if (trade.was_buyer_maker) {
    nextCandle.sell = (nextCandle.sell ?? 0) + trade.quantity;
  } else {
    nextCandle.buy = (nextCandle.buy ?? 0) + trade.quantity;
  }
  nextCandle.volume = (nextCandle.volume ?? 0) + trade.quantity;

  return {
    currentCandle: nextCandle,
    ignored: false,
  };
}
