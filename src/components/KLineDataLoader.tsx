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

    const symbolName = symbol;
    let currentCandle: KLineData | null = null;
    let unsubscribeTrade: (() => void) | undefined;

    const updateTrade = (trade: WebsocketTradeEvent) => {
      if (trade.symbol !== symbolName) {
        return;
      }
      const roundTime = roundToNearestDate(trade.trade_time, timeframe);

      // If it's a new candle, reset
      if (!currentCandle || currentCandle.timestamp !== roundTime) {
        currentCandle = {
          timestamp: roundTime,
          open: trade.price,
          close: trade.price,
          high: trade.price,
          low: trade.price,
          buy: trade.was_buyer_maker ? 0 : trade.quantity,
          sell: trade.was_buyer_maker ? trade.quantity : 0,
          volume: trade.quantity,
        };
      } else {
        // Update existing candle
        currentCandle.close = trade.price;
        currentCandle.high = Math.max(currentCandle.high, trade.price);
        currentCandle.low = Math.min(currentCandle.low, trade.price);
        if (trade.was_buyer_maker) {
          const prevSell =
            typeof currentCandle["sell"] === "number"
              ? currentCandle["sell"]
              : 0;
          currentCandle["sell"] = prevSell + trade.quantity;
        } else {
          const prevBuy =
            typeof currentCandle["buy"] === "number" ? currentCandle["buy"] : 0;
          currentCandle["buy"] = prevBuy + trade.quantity;
        }
        currentCandle.volume = (currentCandle.volume || 0) + trade.quantity;
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
        enableRealTime && symbolName && adapter.subscribeTrade
          ? (params: { callback: (data: KLineData) => void }) => {
              const { callback } = params;
              unsubscribeTrade = adapter.subscribeTrade?.(
                symbolName,
                (trade: WebsocketTradeEvent) => {
                  updateTrade(trade);
                  if (currentCandle) {
                    callback(currentCandle);
                  }
                }
              );
            }
          : undefined,
      unsubscribeBar:
        enableRealTime && symbolName && adapter.subscribeTrade
          ? () => {
              unsubscribeTrade?.();
              unsubscribeTrade = undefined;
            }
          : undefined,
    };

    chart.setDataLoader(dataLoader);

    // Cleanup function when component unmounts or dependencies change
    return () => {
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
