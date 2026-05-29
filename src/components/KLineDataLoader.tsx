import { KLineData, DataLoaderGetBarsParams } from "klinecharts";
import { roundToNearestDate } from "../utils/date";
import { useEffect } from "react";
import { useChart } from "../context/chart";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { parseInputFloat } from "../utils/number";
import { WebsocketTradeEvent } from "../types/client/websocket";
import { useKLineChartDataAdapter } from "../context/dataAdapterContext";
import {
  KLineChartBar,
  KLineChartLoadBarsParams,
} from "../types/client/dataAdapter";

const KLINE_SIZE = 500;

type Props = {
  symbolKey: string;
  timeframe: number;
  timeEndLoader?: number;
  symbol?: string;
  enableRealTime?: boolean;
};

function getParams(
  timeframe: number,
  { type, timestamp }: DataLoaderGetBarsParams,
  timeEndLoader?: number
): Omit<KLineChartLoadBarsParams, "symbolKey"> | undefined {
  if (type === "init") {
    const initDateTime = timeEndLoader || +new Date();
    const nearestCurrentTime = roundToNearestDate(initDateTime, timeframe);

    return {
      timeStart: nearestCurrentTime - timeframe * KLINE_SIZE * 1_000,
      timeEnd: nearestCurrentTime + timeframe * 2_000,
      timeframe,
      limit: KLINE_SIZE,
    };
  }

  if (type === "backward" && timestamp) {
    return {
      timeStart: timestamp + timeframe * 1_000,
      timeEnd: timestamp + timeframe * KLINE_SIZE * 1_000,
      timeframe,
      limit: KLINE_SIZE,
    };
  }

  if (type === "forward" && timestamp) {
    return {
      timeStart: timestamp - timeframe * (KLINE_SIZE + 1) * 1_000,
      timeEnd: timestamp - 1,
      timeframe,
      limit: KLINE_SIZE,
    };
  }
}

function loadDataByParams(
  queryClient: QueryClient,
  loadBars: (params: KLineChartLoadBarsParams) => Promise<KLineChartBar[]>,
  symbolKey: string,
  queryParams: Omit<KLineChartLoadBarsParams, "symbolKey">,
  callback: (dataList: KLineData[], more?: boolean) => void
) {
  queryClient
    .fetchQuery({
      queryKey: ["TradeGroupLines", symbolKey, queryParams],
      queryFn: () => loadBars({ symbolKey, ...queryParams }),
    })
    .then((lines) =>
      lines.map(
        (line): KLineData => ({
          timestamp: line.time,
          open: line.open,
          close: line.close,
          high: line.high,
          low: line.low,
          buy: parseInputFloat(line.qty_buy, 0),
          sell: parseInputFloat(line.qty_sell, 0),
          volume:
            parseInputFloat(line.qty_buy, 0) +
            Math.abs(parseInputFloat(line.qty_sell, 0)),
        })
      )
    )
    .then((data) => {
      const more = data.length !== 0;
      callback(data, more);
    });
}

export function KLineDataLoader({
  symbolKey,
  timeframe,
  timeEndLoader,
  symbol,
  enableRealTime = true,
}: Props) {
  const chart = useChart();
  const queryClient = useQueryClient();
  const adapter = useKLineChartDataAdapter();

  // Setup data loader following klinecharts official API
  useEffect(() => {
    if (!chart) {
      return;
    }

    // Extract trading pair from symbolKey (format: "EXCHANGE#PAIR#TYPE")
    const symbolName = symbol ? symbol.split("#")[1] : symbol;
    // Map from timestamp → accumulated candle; preserves all candles that
    // closed while the tab was hidden and RAF was paused.
    const pendingCandles = new Map<number, KLineData>();
    let unsubscribeTrade: (() => void) | undefined;
    let unsubscribeProjection: (() => void) | undefined;
    let animationFrameId: number | undefined;
    let barCallback: ((data: KLineData) => void) | undefined;

    // Subscribe to projection events so api_exchange streams projection data
    // regardless of whether any projection UI components are mounted.
    if (enableRealTime && symbolKey && adapter.subscribeProjection) {
      unsubscribeProjection = adapter.subscribeProjection(symbolKey, () => {});
    }

    const flushUpdate = () => {
      if (barCallback && pendingCandles.size > 0) {
        // Flush in chronological order so the chart receives candles in sequence.
        const sorted = Array.from(pendingCandles.values()).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        pendingCandles.clear();
        for (const candle of sorted) {
          barCallback(candle);
        }
      }
      animationFrameId = undefined;
    };

    const updateTrade = (trade: WebsocketTradeEvent) => {
      if (trade.symbol !== symbolName) {
        return;
      }
      const roundTime = roundToNearestDate(trade.trade_time, timeframe);
      const existing = pendingCandles.get(roundTime);

      if (!existing) {
        pendingCandles.set(roundTime, {
          timestamp: roundTime,
          open: trade.price,
          close: trade.price,
          high: trade.price,
          low: trade.price,
          buy: trade.was_buyer_maker ? 0 : trade.quantity,
          sell: trade.was_buyer_maker ? trade.quantity : 0,
          volume: trade.quantity,
        });
      } else {
        existing.close = trade.price;
        existing.high = Math.max(existing.high, trade.price);
        existing.low = Math.min(existing.low, trade.price);
        if (trade.was_buyer_maker) {
          existing["sell"] =
            ((existing["sell"] as number) || 0) + trade.quantity;
        } else {
          existing["buy"] = ((existing["buy"] as number) || 0) + trade.quantity;
        }
        existing.volume = (existing.volume || 0) + trade.quantity;
      }

      if (animationFrameId === undefined) {
        animationFrameId = requestAnimationFrame(flushUpdate);
      }
    };

    // Create the data loader with getBars, subscribeBar, and unsubscribeBar
    const dataLoader = {
      getBars: (params: DataLoaderGetBarsParams) => {
        const { callback, type, timestamp } = params;
        const queryParams = getParams(timeframe, params, timeEndLoader);

        if (!queryParams) {
          callback([], false);
          return;
        }

        if (!symbolKey) {
          console.error(
            `[KLineDataLoader] symbolKey is empty, skipping getBars`
          );
          callback([], false);
          return;
        }

        if (
          timeEndLoader &&
          type !== "init" &&
          (!timestamp || timestamp > timeEndLoader)
        ) {
          callback([], false);
          return;
        }

        loadDataByParams(
          queryClient,
          adapter.loadBars,
          symbolKey,
          queryParams,
          callback
        );
      },
      subscribeBar:
        enableRealTime && symbolKey && adapter.subscribeTrade
          ? (params: { callback: (data: KLineData) => void }) => {
              const { callback } = params;
              barCallback = callback;
              unsubscribeTrade = adapter.subscribeTrade?.(
                symbolKey,
                updateTrade
              );
            }
          : undefined,
      unsubscribeBar:
        enableRealTime && symbolKey && adapter.subscribeTrade
          ? () => {
              unsubscribeTrade?.();
              unsubscribeTrade = undefined;
            }
          : undefined,
    };

    chart.setDataLoader(dataLoader);

    // Cleanup function when component unmounts or dependencies change
    return () => {
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
      unsubscribeProjection?.();
      // Reset data loader to stop real-time updates
      chart.setDataLoader({
        getBars: (params) => {
          params.callback([], false);
        },
      });
    };
  }, [
    chart,
    queryClient,
    adapter,
    timeframe,
    symbolKey,
    timeEndLoader,
    symbol,
    enableRealTime,
  ]);

  return null;
}
