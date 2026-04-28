import { useSymbol } from "./hooks/api/symbolHooks";
import { BotSchema } from "./types/client/bot";
import { SymbolType } from "./types/client/symbol";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";

type Props = { bot: BotSchema };

type ContentProps = {
  bot: BotSchema;
  token: SymbolType;
};

function KLineChartBotContent({ bot, token }: ContentProps) {
  const { position } = useChartSettings();

  return (
    <>
      {position.showFinished && <KLineChartFinishedPositions botId={bot.id} />}
      <KLineChartProgressPositions botId={bot.id} tokenName={token.symbol} />
    </>
  );
}

export function KLineChartBot({ bot }: Props) {
  const token = useSymbol(bot.symbol_id);

  if (token === undefined) {
    console.error(`[KLineChartBot] symbol not found for bot.symbol_id=${bot.symbol_id}`);
  }

  return (
    <KLineChart token={token} chartSettingName="Bot" height={600}>
      {token && <KLineChartBotContent token={token} bot={bot} />}
    </KLineChart>
  );
}
