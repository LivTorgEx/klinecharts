import { jsx as _jsx } from "react/jsx-runtime";
import { getTradeGroupLines, } from "../../api/tradeGroupLine";
import { roundToNearestDate } from "../../utils/date";
import { useContext, useEffect } from "react";
import { useChart } from "../context/chart";
import { useQueryClient } from "@tanstack/react-query";
import { parseInputFloat } from "../../utils/number";
import { ButtonDateTimePicker } from "../../components/elements/ButtonDateTimePicker";
import { WebsocketEventName, } from "../../types/client/websocket";
import { ClientWebSocketContext } from "../../context/clientWebSocketContext";
const KLINE_SIZE = 500;
function getParams(timeframe, { type, timestamp }, timeEndLoader) {
    if (type === "init") {
        const initDateTime = timeEndLoader || +new Date();
        const nearestCurrentTime = roundToNearestDate(initDateTime, timeframe);
        return {
            timeStart: nearestCurrentTime - timeframe * KLINE_SIZE * 1000,
            timeEnd: nearestCurrentTime + timeframe * 2000,
            timeframe,
            limit: KLINE_SIZE,
        };
    }
    if (type === "backward" && timestamp) {
        return {
            timeStart: timestamp + timeframe * 1000,
            timeEnd: timestamp + timeframe * KLINE_SIZE * 1000,
            timeframe,
            limit: KLINE_SIZE,
        };
    }
    if (type === "forward" && timestamp) {
        return {
            timeStart: timestamp - timeframe * (KLINE_SIZE + 1) * 1000,
            timeEnd: timestamp - 1,
            timeframe,
            limit: KLINE_SIZE,
        };
    }
}
function loadDataByParams(queryClient, tradeGroupId, queryParams, callback) {
    queryClient
        .fetchQuery({
        queryKey: ["TradeGroupLines", tradeGroupId, queryParams],
        queryFn: () => getTradeGroupLines({
            tradeGroupId,
            ...queryParams,
        }),
    })
        .then((lines) => lines.map((line) => ({
        timestamp: line.time,
        open: line.open,
        close: line.close,
        high: line.high,
        low: line.low,
        buy: parseInputFloat(line.qty_buy, 0),
        sell: parseInputFloat(line.qty_sell, 0),
        volume: parseInputFloat(line.qty_buy, 0) +
            Math.abs(parseInputFloat(line.qty_sell, 0)),
    })))
        .then((data) => {
        const more = data.length !== 0;
        callback(data, more);
    });
}
export function KLineDataLoader({ tradeGroupId, timeframe, timeEndLoader, symbol, enableRealTime = true, }) {
    const chart = useChart();
    const queryClient = useQueryClient();
    const ws = useContext(ClientWebSocketContext);
    const handleGoTo = (value) => {
        if (chart && value instanceof Date) {
            const timeEnd = roundToNearestDate(+value + (KLINE_SIZE / 2) * timeframe * 1000, timeframe);
            // Scroll to the timestamp - klinecharts will fetch data via dataLoader if needed
            chart.scrollToTimestamp(timeEnd);
        }
    };
    // Setup data loader following klinecharts official API
    useEffect(() => {
        if (!chart) {
            return;
        }
        const symbolName = symbol;
        let currentCandle = null;
        let tradeHandler = null;
        const updateTrade = (trade) => {
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
            }
            else {
                // Update existing candle
                currentCandle.close = trade.price;
                currentCandle.high = Math.max(currentCandle.high, trade.price);
                currentCandle.low = Math.min(currentCandle.low, trade.price);
                if (trade.was_buyer_maker) {
                    currentCandle.sell += trade.quantity;
                }
                else {
                    currentCandle.buy += trade.quantity;
                }
                currentCandle.volume = (currentCandle.volume || 0) + trade.quantity;
            }
        };
        // Create the data loader with getBars, subscribeBar, and unsubscribeBar
        const dataLoader = {
            getBars: (params) => {
                const { callback, type, timestamp } = params;
                const queryParams = getParams(timeframe, params, timeEndLoader);
                if (!queryParams) {
                    callback([], false);
                    return;
                }
                if (timeEndLoader &&
                    type !== "init" &&
                    (!timestamp || timestamp > timeEndLoader)) {
                    callback([], false);
                    return;
                }
                loadDataByParams(queryClient, tradeGroupId, queryParams, callback);
            },
            subscribeBar: enableRealTime && symbolName && ws.isConnected
                ? (params) => {
                    const { callback } = params;
                    tradeHandler = (trade) => {
                        updateTrade(trade);
                        if (currentCandle) {
                            callback(currentCandle);
                        }
                    };
                    ws.subscribe(WebsocketEventName.Trade, tradeHandler);
                    ws.sendSubscribe({ event: "Trade", symbol: symbolName });
                }
                : undefined,
            unsubscribeBar: enableRealTime && symbolName && ws.isConnected
                ? () => {
                    if (tradeHandler) {
                        ws.unsubscribe(WebsocketEventName.Trade, tradeHandler);
                    }
                    ws.sendUnSubscribe({ event: "Trade", symbol: symbolName });
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
        timeframe,
        tradeGroupId,
        timeEndLoader,
        symbol,
        enableRealTime,
        ws,
    ]);
    return _jsx(ButtonDateTimePicker, { onAccept: handleGoTo });
}
