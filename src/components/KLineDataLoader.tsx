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
    let currentCandle: KLineData | null = null;
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
      if (currentCandle && barCallback) {
        barCallback(currentCandle);
      }
      animationFrameId = undefined;
    };

    const updateTrade = (trade: WebsocketTradeEvent) => {
      if (trade.symbol !== symbolName) {
        return;
      }
      const roundTime = roundToNearestDate(trade.trade_time, timeframe);

      if (!currentCandle || currentCandle.timestamp !== roundTime) {
        // Current candle closed — force-push it immediately so it is never
        // lost while the tab is hidden and RAF is paused.
        if (currentCandle && barCallback) {
          if (animationFrameId !== undefined) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = undefined;
          }
          barCallback(currentCandle);
        }

        // Seed the new candle from the chart's own last bar when timestamps
        // match, so we start with the correct historical baseline rather than
        // discarding volume/OHLC data that was loaded via getBars.
        const dataList = chart.getDataList();
        const lastBar = dataList[dataList.length - 1];
        const base = lastBar?.timestamp === roundTime ? lastBar : null;

        currentCandle = {
          timestamp: roundTime,
          open: base?.open ?? trade.price,
          close: trade.price,
          high: Math.max(base?.high ?? trade.price, trade.price),
          low: Math.min(base?.low ?? trade.price, trade.price),
          buy: (base?.buy ?? 0) + (trade.was_buyer_maker ? 0 : trade.quantity),
          sell:
            (base?.sell ?? 0) + (trade.was_buyer_maker ? trade.quantity : 0),
          volume: (base?.volume ?? 0) + trade.quantity,
        };
      } else {
        currentCandle.close = trade.price;
        currentCandle.high = Math.max(currentCandle.high, trade.price);
        currentCandle.low = Math.min(currentCandle.low, trade.price);
        if (trade.was_buyer_maker) {
          currentCandle.sell = (currentCandle.sell ?? 0) + trade.quantity;
        } else {
          currentCandle.buy = (currentCandle.buy ?? 0) + trade.quantity;
        }
        currentCandle.volume = (currentCandle.volume ?? 0) + trade.quantity;
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
