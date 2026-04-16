/**
 * Minimal local type that mirrors TradeSettingProIndicatorType["type"]
 * from @livtorgex/strategy-types. Only the "type" discriminant is needed
 * within klinecharts — the full Zod-inferred union lives in strategy-types.
 */
export type TradeSettingProIndicatorTypeName = "Psar" | "Smi" | "Lsma" | "Natr" | "Ema" | "ChandelierExit" | "BollingerBands" | "ATRTralling" | "Supertrend" | "Rsi" | "Mfi" | "Cci" | "ZigZagTrend" | "Stoch" | "Imbalance" | "Mrc" | "Window" | "Wave" | "EmaCross" | "Volume" | "Smc" | "DPSignal" | "Ntps" | "Candle";
export type TradeSettingProIndicatorType = {
    type: TradeSettingProIndicatorTypeName;
};
