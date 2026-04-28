import { useSymbol } from "./hooks/api/symbolHooks";
import { SymbolType } from "./types/client/symbol";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";

type Props = { botId: number; tokenId: number };

type ContentProps = {
  botId: number;
  token: SymbolType;
};

function KLineChartBotContent({ botId, token }: ContentProps) {
  const { position } = useChartSettings();

  return (
    <>
      {position.showFinished && <KLineChartFinishedPositions botId={botId} />}
      <KLineChartProgressPositions botId={botId} tokenName={token.symbol} />
    </>
  );
}

export function KLineChartPosition({ botId, tokenId }: Props) {
  const token = useSymbol(tokenId);

  if (token === undefined) {
    console.error(`[KLineChartPosition] symbol not found for tokenId=${tokenId} botId=${botId}`);
  }

  return (
    <KLineChart token={token} chartSettingName="Position">
      {token && <KLineChartBotContent token={token} botId={botId} />}
    </KLineChart>
  );
}
