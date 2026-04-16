import { useEffect, useRef } from "react";
import { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { SRLineParams } from "../overlays/srLine";
import { useTradeIndicator } from "../hooks/api/tradeIndicator";

type Props = {
  symbolId: number;
  timeframe: number;
};

export function KLineProjectionLines({ symbolId, timeframe }: Props) {
  const chart = useChart();
  const { data: indicator } = useTradeIndicator({
    symbol_id: symbolId,
    timeframe,
  });
  const overlayKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!indicator || !chart || !indicator.indicators.window) {
      return;
    }

    const { window } = indicator.indicators;
    const data: {
      data?: SRLineParams;
      price: number;
      name: string;
      points: OverlayCreate["points"];
    }[] = [];

    [
      [
        "Buy",
        {
          price: window.BuyPrice,
          klines: window.BuyKLines,
          direction: window.BuyDirection,
          crosses: window.BuyCross,
          qtym: window.BQM,
        },
      ] as const,
      [
        "Sell",
        {
          price: window.SellPrice,
          klines: window.SellKLines,
          direction: window.SellDirection,
          crosses: window.SellCross,
          qtym: window.SQM,
        },
      ] as const,
      [
        "Cross",
        {
          price: window.CrossPrice,
          klines: window.CrossKLines,
          direction: window.CrossDirection,
          crosses: window.CrossTimes,
          qtym: window.CQM,
        },
      ] as const,
    ].forEach(([name, line]) => {
      if (!line.price || !line.klines) {
        return;
      }

      data.push({
        name: "srLine",
        data: {
          message: [
            `${name}[${line.direction}|${line.crosses}${line.qtym ? `|${Number(line.qtym).toFixed(2)}` : ""}]`,
          ].join(" "),
          type: name,
        },
        price: Number(line.price),
        points: [
          {
            timestamp: +new Date() - Number(line.klines) * timeframe * 1_000,
            value: Number(line.price),
          },
          { timestamp: +new Date(), value: Number(line.price) },
        ],
      });
    });

    const removeSet = new Set(overlayKeys.current);
    data.forEach((line) => {
      const id = `projection_${line.name}_${line.price}`;
      const extendData = line.data;
      if (chart.getOverlays({ id }).length) {
        chart.overrideOverlay({ id, points: line.points, extendData });
      } else {
        chart.createOverlay({
          name: line.name,
          id,
          lock: true,
          points: line.points,
          extendData,
        });
      }
      overlayKeys.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
    });
  }, [indicator, chart, timeframe]);

  useEffect(() => {
    if (!chart) {
      return;
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      overlayKeys.current.forEach((id) => {
        chart.removeOverlay({ id });
      });
    };
  }, [chart]);

  return null;
}
