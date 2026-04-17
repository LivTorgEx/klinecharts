import { useEffect, useRef, useState } from "react";
import { Overlay, OverlayCreate } from "klinecharts";

import { useBotPositions } from "../hooks/api/botPositionHooks";
import { useChart } from "../context/chart";
import { parseServerDate } from "../utils/date";
import { WebsocketTradeEvent } from "../types/client/websocket";
import { toMeasurePrice } from "../utils/number";
import { useChartSettings } from "../context/chartSettings";
import { PositionOrderType } from "../types/client/order";
import { KLineChartPositionData } from "../overlays/position";
import { useSubscribeTrade } from "../context/dataAdapterContext";

type Props = {
  botId: number;
  tokenName: string;
};

export function KLineChartProgressPositions({ botId, tokenName }: Props) {
  const chart = useChart();
  const subscribeTrade = useSubscribeTrade();
  const { timeframe } = useChartSettings();
  const { data: positions } = useBotPositions({
    bot_id: botId,
    status: ["Created", "InProgress"],
  });
  const [price, setPrice] = useState<number | undefined>();
  const existingPositionKeys = useRef<Set<string>>(new Set());
  const existingOrderKeys = useRef<Set<string>>(new Set());

  // Cleanup all position and order overlays when component unmounts
  useEffect(() => {
    const positionKeysToRemove = existingPositionKeys.current;
    const orderKeysToRemove = existingOrderKeys.current;
    return () => {
      if (chart) {
        positionKeysToRemove.forEach((id) => {
          chart.removeOverlay({ id });
        });
        orderKeysToRemove.forEach((id) => {
          chart.removeOverlay({ id });
        });
        positionKeysToRemove.clear();
        orderKeysToRemove.clear();
      }
    };
  }, [chart]);

  useEffect(() => {
    if (!chart) {
      return;
    }

    const removeSet = new Set(existingPositionKeys.current);
    positions?.data?.forEach((position) => {
      const assetSize = position.qty * position.entry_price;
      const change = toMeasurePrice(position.entry_price, price!) / 100;

      const extendData: KLineChartPositionData = {
        qty: position.qty,
        pnl: change * assetSize,
        fee: position.fee,
        totalProfit: position.total_profit,
        entryPrice: position.entry_price,
      };

      const points: OverlayCreate["points"] = [
        {
          timestamp: +parseServerDate(position.created_at),
          value: position.entry_price,
        },
      ];
      const id = `position_${position.id}`;
      const overlay = chart.getOverlays({
        id,
      })[0] as Overlay<KLineChartPositionData> | undefined;
      if (overlay) {
        if (
          overlay.extendData.qty !== extendData.qty ||
          overlay.extendData.pnl !== extendData.pnl ||
          overlay.extendData.fee !== extendData.fee ||
          overlay.extendData.totalProfit !== extendData.totalProfit ||
          overlay.extendData.entryPrice !== extendData.entryPrice
        ) {
          chart.overrideOverlay({ id, points, extendData });
        }
      } else {
        chart.createOverlay({
          name: "position",
          id,
          lock: true,
          points,
          extendData,
        });
      }
      existingPositionKeys.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      existingPositionKeys.current.delete(id);
    });
  }, [positions, chart, price]);

  useEffect(() => {
    if (!chart) {
      return;
    }

    const removeSet = new Set(existingOrderKeys.current);
    positions?.data?.forEach((position) => {
      position.orders.forEach((order) => {
        let id = `order_${order.id}`;
        const timestamp = +parseServerDate(order.update_at ?? "");
        const orderPrice = order.price || order.stop_price || 0;
        const positionAmount = position.qty * position.entry_price;
        const positionFactor = position.qty > 0 ? 1 : -1;
        const points: OverlayCreate["points"] = [
          {
            timestamp,
            value: orderPrice,
          },
        ];
        if (["New", "PartiallyFilled"].includes(order.status ?? "")) {
          id += "_order";
          let pnl = undefined;
          const qtyFactor = order.qty > 0 ? 1 : -1;
          if (
            order.order_type === PositionOrderType.StopMarket &&
            order.price === 0
          ) {
            const pricePrc = toMeasurePrice(position.entry_price, orderPrice);
            const floatingPnl = (pricePrc * positionAmount) / 100;
            pnl = position.total_profit - position.fee + floatingPnl;
          } else if (
            order.qty !== 0 &&
            order.qty !== undefined &&
            qtyFactor !== positionFactor
          ) {
            const pricePrc =
              toMeasurePrice(position.entry_price, orderPrice) / 100;
            const closePosAmount = Math.abs(order.qty) * position.entry_price;
            pnl = pricePrc * closePosAmount * positionFactor;
          }
          const extendData = {
            order_type: order.order_type,
            qty: order.qty,
            id: order.id,
            client_id: order.client_id,
            original_id: order.original_id,
            price: orderPrice,
            pnl,
          };
          if (chart.getOverlays({ id }).length) {
            chart.overrideOverlay({ id, points, extendData });
          } else {
            chart.createOverlay({
              name: "order",
              id,
              points,
              lock: false,
              extendData,
            });
          }
        } else if (Math.abs(order.qty_filled ?? 0) > 0) {
          id += "_orderFilled";
          if (!chart.getOverlays({ id }).length) {
            chart.createOverlay({
              name: "orderFilled",
              id,
              points,
              lock: true,
              extendData: { ...order, timestamp, timeframe },
            });
          }
        } else {
          return;
        }

        existingOrderKeys.current.add(id);
        removeSet.delete(id);
      });
    });
    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      existingOrderKeys.current.delete(id);
    });
  }, [positions, chart, timeframe]);

  useEffect(() => {
    if (!subscribeTrade) {
      return;
    }

    function updateTrade(event: WebsocketTradeEvent) {
      if (event.symbol === tokenName) {
        setPrice(event.price);
      }
    }

    return subscribeTrade(tokenName, updateTrade);
  }, [subscribeTrade, tokenName]);

  return null;
}
