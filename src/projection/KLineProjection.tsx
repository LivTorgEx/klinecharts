import { useChartSettings } from "../context/chartSettings";
import { KLineProjectionLines } from "./KLineProjectionLines";
import { KLineProjectionMessages } from "./KLineProjectionMessages";
import { KLineProjectionMovements } from "./KLineProjectionMovements";
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
      {projection.showMessages && (
        <KLineProjectionMessages />
      )}
      {projection.showOrderBookLines && (
        <KLineProjectionOrderBook />
      )}
      {projection.showLines && (
        <KLineProjectionLines symbolId={symbolId} timeframe={timeframe} />
      )}
      {projection.showMovements && (
        <KLineProjectionMovements />
      )}
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
