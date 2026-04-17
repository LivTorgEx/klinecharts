import { useCallback, useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";

import { WebsocketProjectionEvent } from "../types/client/websocket";
import { formatBigNumber, toMeasurePrice } from "../utils/number";
import { useChartSettings } from "../context/chartSettings";
import { useSubscribeProjection } from "../context/dataAdapterContext";

type Props = {
  tokenName: string;
};

export function KLineProjectionMessages({ tokenName }: Props) {
  const subscribeProjection = useSubscribeProjection();
  const { timeframe } = useChartSettings();
  const [messages, setMessages] = useState<string[]>([]);

  const handleUpdateProjection = useCallback(
    (projection: WebsocketProjectionEvent) => {
      if (projection.symbol !== tokenName) {
        return;
      }
      const fastTrade = projection.indicator.ntps_fast_time
        ? `${(projection.indicator.ntps_fast_time / 1000).toFixed(0)}secs`
        : "IDLE";
      const asset = formatBigNumber(projection.indicator.asset_01 * 100);
      const asset_diff = formatBigNumber(
        projection.indicator.asset_diff_01 * 100
      );

      const messages = [
        [
          projection.status,
          `NTPS: ${projection.indicator.ntps}|${fastTrade}`,
          `TrandM: ${projection.indicator.trandm.toFixed(2)}%`,
          `Asset: ${asset}|${asset_diff}/1%`,
        ].join("    "),
      ];

      const commonMessage = [
        "Price",
        `1h:${projection.indicator.price_1h.toFixed(2)}%`,
        `4h:${projection.indicator.price_4h.toFixed(2)}%`,
        `8h:${projection.indicator.price_8h.toFixed(2)}%`,
        `24h:${projection.indicator.price_24h.toFixed(2)}%`,
      ];
      messages.push(commonMessage.join("  "));

      if (projection.order_book) {
        const ob = projection.order_book;
        const orderBookMessage = ["OrderBook"];

        if (ob.buy_amount) {
          orderBookMessage.push(`Buy: ${formatBigNumber(ob.buy_amount)}`);
        }
        if (ob.sell_amount) {
          orderBookMessage.push(`Sell: ${formatBigNumber(ob.sell_amount)}`);
        }

        if (ob.buy_amount && ob.sell_amount) {
          const ratio = ob.buy_amount / ob.sell_amount;
          orderBookMessage.push(`Ratio (B/S): ${ratio.toFixed(2)}%`);
        }

        if (ob.buy_price && ob.sell_price) {
          const spread = toMeasurePrice(ob.buy_price, ob.sell_price);
          orderBookMessage.push(`Spread: ${spread.toFixed(2)}%`);
        }
        if (ob.long_levels[0] && ob.short_levels[0]) {
          const spread = toMeasurePrice(
            ob.short_levels[0].price,
            ob.long_levels[0].price
          );
          orderBookMessage.push(`Spread[0]: ${spread.toFixed(2)}%`);
        }
        if (ob.long_levels[4] && ob.short_levels[4]) {
          const spread = toMeasurePrice(
            ob.short_levels[4].price,
            ob.long_levels[4].price
          );
          orderBookMessage.push(`Spread[4]: ${spread.toFixed(2)}%`);
        }
        messages.push(orderBookMessage.join("  "));
      }

      if (projection.oi) {
        const oi = projection.oi;
        const oiMessage = [
          `Open Interest: ${formatBigNumber(oi.usd)}`,
          `Change: ${oi.change.toFixed(2)}%`,
          `ChangeQTY: ${formatBigNumber(oi.change_qty, "")}|${formatBigNumber(oi.change_qty * (projection.price ?? 0))}`,
          `Average: ${formatBigNumber(oi.avg * (projection.price ?? 0))}`,
          `Candle: ${formatBigNumber(projection.candle?.qtym_asset ?? 0)}`,
        ];
        messages.push(oiMessage.join("  "));
      }

      const wave = projection.waves[timeframe];

      if (wave) {
        const blocks = (wave.exit_time - wave.enter_time) / 1_000 / timeframe;
        const prc = toMeasurePrice(wave.enter_price, wave.exit_price).toFixed(
          2
        );
        messages.push(
          [
            `Wave[${wave.direction}|${(timeframe / 60).toFixed(0)}m|${prc}%]`,
            `Blocks: ${blocks.toFixed(2)}`,
            `QTYM: ${wave.qtym.toFixed(2)}%`,
            `Percentile: ${wave.percentile.toFixed(2)}`,
            wave.over_candles
              .map(([idx, c]) => `${c.toFixed(2)}%(${idx})`)
              .join(" "),
          ].join("    ")
        );
      }

      setMessages(messages);
    },
    [tokenName, timeframe]
  );

  useEffect(() => {
    setMessages([]);

    if (!subscribeProjection) {
      return;
    }

    return subscribeProjection(tokenName, handleUpdateProjection);
  }, [subscribeProjection, tokenName, handleUpdateProjection]);

  return (
    <Stack>
      {messages.map((messages, idx) => (
        <Typography key={idx} variant="caption">
          {messages}
        </Typography>
      ))}
    </Stack>
  );
}
