import { useSymbol } from "./hooks/api/symbolHooks";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";

type Props = { botId: number; tokenId: number };

type ContentProps = {
  botId: number;
};

function KLineChartBotContent({ botId }: ContentProps) {
  const { position } = useChartSettings();

  return (
    <>
      {position.showFinished && <KLineChartFinishedPositions botId={botId} />}
      <KLineChartProgressPositions botId={botId} />
    </>
  );
}

export function KLineChartPositionView({ botId, tokenId }: Props) {
  const token = useSymbol(tokenId);

  if (token === undefined) {
    console.error(
      `[KLineChartPositionView] symbol not found for tokenId=${tokenId} botId=${botId}`
    );
  }

  return (
    <KLineChart token={token} chartSettingName="Position">
      {token && <KLineChartBotContent botId={botId} />}
    </KLineChart>
  );
}
