import { useSymbolKeyFromAll } from "./hooks/api/symbolHooks";
import { BotSchema } from "./types/client/bot";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";

type Props = { bot: BotSchema };

type ContentProps = {
  bot: BotSchema;
};

function KLineChartBotContent({ bot }: ContentProps) {
  const { position } = useChartSettings();

  return (
    <>
      {position.showFinished && <KLineChartFinishedPositions botId={bot.id} />}
      <KLineChartProgressPositions botId={bot.id} />
    </>
  );
}

export function KLineChartBot({ bot }: Props) {
  const token = useSymbolKeyFromAll(bot.symbol_key);

  if (token === undefined) {
    console.error(
      `[KLineChartBot] symbol not found for bot.symbol_key=${bot.symbol_key}`
    );
  }

  return (
    <KLineChart token={token} chartSettingName="Bot" height={600}>
      {token && <KLineChartBotContent bot={bot} />}
    </KLineChart>
  );
}
