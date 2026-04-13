import { useChartSettings } from "../context/chartSettings";
import { KLineProjectionLines } from "./KLineProjectionLines";
import { KLineProjectionMessages } from "./KLineProjectionMessages";
import { KLineProjectionMovements } from "./KLineProjectionMovements";
import { KLineProjectionOrderBook } from "./KLineProjectionOrderBook";
import { KLinePropjectionIndicators } from "./KLinePropjectionIndicators";

type Props = {
  tokenName: string;
  symbolId: number;
  timeframe: number;
  selectedTime?: number;
  clearSelectedTime(): void;
};

export function KLineProjection({
  tokenName,
  symbolId,
  timeframe,
  selectedTime,
  clearSelectedTime,
}: Props) {
  const { projection } = useChartSettings();

  return (
    <>
      {projection.showMessages && (
        <KLineProjectionMessages tokenName={tokenName} />
      )}
      {projection.showOrderBookLines && (
        <KLineProjectionOrderBook tokenName={tokenName} />
      )}
      {projection.showLines && (
        <KLineProjectionLines symbolId={symbolId} timeframe={timeframe} />
      )}
      {projection.showMovements && (
        <KLineProjectionMovements tokenName={tokenName} />
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
