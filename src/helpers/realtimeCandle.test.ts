import test from "node:test";
import assert from "node:assert/strict";

import { applyRealtimeTradeUpdate } from "./realtimeCandle.ts";

test("realtime candle updates, rolls over, and ignores late trades", () => {
  const timeframe = 60;
  const symbolKey = "OKX#BTC-USDT-SWAP#SWAP";
  const firstTick = {
    symbol: symbolKey,
    price: 100,
    quantity: 2,
    was_buyer_maker: false,
    trade_time: 60_000,
  };

  const first = applyRealtimeTradeUpdate({
    currentCandle: null,
    trade: firstTick,
    timeframe,
    symbolKey,
    lastBar: undefined,
  });

  assert.equal(first.ignored, false);
  assert.equal(first.flushedCandle, undefined);
  assert.deepEqual(first.currentCandle, {
    timestamp: 60_000,
    open: 100,
    close: 100,
    high: 100,
    low: 100,
    buy: 2,
    sell: 0,
    volume: 2,
  });

  const secondTick = {
    symbol: symbolKey,
    price: 105,
    quantity: 3,
    was_buyer_maker: true,
    trade_time: 61_000,
  };

  const second = applyRealtimeTradeUpdate({
    currentCandle: first.currentCandle,
    trade: secondTick,
    timeframe,
    symbolKey,
    lastBar: first.currentCandle ?? undefined,
  });

  assert.equal(second.ignored, false);
  assert.equal(second.flushedCandle, undefined);
  assert.deepEqual(second.currentCandle, {
    timestamp: 60_000,
    open: 100,
    close: 105,
    high: 105,
    low: 100,
    buy: 2,
    sell: 3,
    volume: 5,
  });

  const nextMinuteTick = {
    symbol: symbolKey,
    price: 110,
    quantity: 1,
    was_buyer_maker: false,
    trade_time: 120_000,
  };

  const third = applyRealtimeTradeUpdate({
    currentCandle: second.currentCandle,
    trade: nextMinuteTick,
    timeframe,
    symbolKey,
    lastBar: second.currentCandle,
  });

  assert.equal(third.ignored, false);
  assert.deepEqual(third.flushedCandle, second.currentCandle);
  assert.deepEqual(third.currentCandle, {
    timestamp: 120_000,
    open: 110,
    close: 110,
    high: 110,
    low: 110,
    buy: 1,
    sell: 0,
    volume: 1,
  });

  const lateTick = {
    symbol: symbolKey,
    price: 90,
    quantity: 4,
    was_buyer_maker: false,
    trade_time: 119_000,
  };

  const late = applyRealtimeTradeUpdate({
    currentCandle: third.currentCandle,
    trade: lateTick,
    timeframe,
    symbolKey,
    lastBar: third.currentCandle,
  });

  assert.equal(late.ignored, true);
  assert.deepEqual(late.currentCandle, third.currentCandle);
  assert.equal(late.flushedCandle, undefined);
});
