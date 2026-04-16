import { Close } from "@mui/icons-material";
import { format } from "date-fns";
import { IconButton, Stack, Typography } from "@mui/material";
import { TradeSettingProIndicatorType } from "../types/strategyIndicatorType";

import { useTradeIndicator } from "../hooks/api/tradeIndicator";
import { useChartSettings } from "../context/chartSettings";
import { DATETIME_UI } from "../constants/date";

type Props = {
  symbolId: number;
  timeframe: number;
  selectedTime?: number;
  clearSelectedTime(): void;
};

type IndicatorMaps = {
  [K in TradeSettingProIndicatorType["type"]]: string[];
};

const INDICATOR_MAP: IndicatorMaps = {
  ZigZagTrend: ["zigzagtrend"],
  ATRTralling: ["atrtralling"],
  BollingerBands: ["bb_20"],
  Candle: ["candle"],
  Cci: ["cci_20"],
  ChandelierExit: ["cc"],
  Ema: ["ema_20", "ema_200"],
  Imbalance: ["imbalance"],
  Lsma: ["lsma_50"],
  Mfi: ["mfi_14"],
  Mrc: ["mrc_200"],
  Natr: ["natr_14", "natr_30"],
  Psar: ["psar"],
  Rsi: ["rsi_14"],
  Smi: ["smi_10", "smi_25"],
  Stoch: ["stoch_14,1,3"],
  Supertrend: ["supertrend"],
  Wave: ["wave"],
  EmaCross: ["emacross_9,26"],
  Window: ["window"],
  Smc: ["smc"],
  DPSignal: ["dpsignal"],
  Volume: ["volume_50"],
  Ntps: ["ntps"],
};

export function KLinePropjectionIndicators({
  symbolId,
  timeframe,
  selectedTime,
  clearSelectedTime,
}: Props) {
  const {
    projection: { indicators },
  } = useChartSettings();
  const { data: indicator } = useTradeIndicator({
    symbol_id: symbolId,
    timeframe,
    time: selectedTime,
  });

  if (!indicator) {
    return null;
  }

  const values = indicator.indicators;

  return (
    <Stack>
      {selectedTime && (
        <Typography variant="caption">
          Selected time: {format(selectedTime, DATETIME_UI)}{" "}
          <IconButton color="error" size="small" onClick={clearSelectedTime}>
            <Close fontSize="inherit" />
          </IconButton>
        </Typography>
      )}
      {indicators.map(({ name, properties }) => (
        <Stack direction="row" spacing={2} key={name}>
          <Typography variant="caption">{name}</Typography>
          <Stack>
            {INDICATOR_MAP[name]?.map((key) =>
              values[key] ? (
                <Stack direction="row" useFlexGap key={key} sx={{
                  flexWrap: "wrap"
                }}>
                  <Typography variant="caption" sx={{
                    mr: 1
                  }}>
                    ({key})
                  </Typography>
                  {Object.entries(properties)
                    .filter(([, isActive]) => isActive)
                    .map(([propertyName]) => (
                      <Typography variant="caption" key={propertyName} sx={{
                        mr: 1
                      }}>
                        {propertyName}: {values[key][propertyName]}
                      </Typography>
                    ))}
                </Stack>
              ) : (
                <Typography variant="caption" key={key}>
                  Not found
                </Typography>
              )
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
