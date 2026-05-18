import { useChartSettings } from "../context/chartSettings";
import { KLineProjectionMessages } from "./KLineProjectionMessages";
import { KLineProjectionOrderBook } from "./KLineProjectionOrderBook";
import { KLinePropjectionIndicators } from "./KLinePropjectionIndicators";

type Props = {
  /** @deprecated symbolKey is now read from SymbolKeyContext; this prop is unused */
  tokenName?: string;
  symbolId: number;
  timeframe: number;
  selectedTime?: number;
  clearSelectedTime(): void;
};

export function KLineProjection({
  symbolId,
  timeframe,
  selectedTime,
  clearSelectedTime,
}: Props) {
  const { projection } = useChartSettings();

  return (
    <>
      {projection.showMessages && <KLineProjectionMessages />}
      {projection.showOrderBookLines && <KLineProjectionOrderBook />}
      {!!projection.indicators &&
        !!Object.keys(projection.indicators).length && (
          <KLinePropjectionIndicators
            symbolId={symbolId}
            timeframe={timeframe}
            selectedTime={selectedTime}
            clearSelectedTime={clearSelectedTime}
          />
        )}
    </>
  );
}
