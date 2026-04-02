import { KLineData, registerIndicator } from "klinecharts";
import { ExponentialMovingAverage } from "./exponentialMovingAverage";
import { OrderDirection } from "../../types/client/order";

type EmaCrossOutput = {
  emaSlow: number;
  emaFast: number;
  cross?: number;
};

class EmaCross {
  private emaSlow: ExponentialMovingAverage;
  private emaFast: ExponentialMovingAverage;
  private direction: OrderDirection = OrderDirection.BOTH;

  constructor(periodFast: number, periodSlow: number) {
    this.emaFast = new ExponentialMovingAverage(periodFast);
    this.emaSlow = new ExponentialMovingAverage(periodSlow);
  }

  next = (input: KLineData): EmaCrossOutput => {
    const emaFast = this.emaFast.next(input.close);
    const emaSlow = this.emaSlow.next(input.close);

    const direction =
      emaSlow > emaFast ? OrderDirection.SHORT : OrderDirection.LONG;
    let isChanged = false;

    if (this.direction != direction) {
      this.direction = direction;
      isChanged = true;
    }

    return {
      emaFast,
      emaSlow,
      cross: isChanged ? input.close : undefined,
    };
  };
}

registerIndicator<EmaCrossOutput, number>({
  name: "EMACross",
  shortName: "EMACross",
  calcParams: [9, 26],
  precision: 12,
  figures: [
    { key: "emaFast", title: "Fast: ", type: "line" },
    { key: "emaSlow", title: "Slow: ", type: "line" },
  ],
  calc: (kLineDataList, indicator) => {
    const [periodFast, periodSlow] = indicator.calcParams;
    const emaCross = new EmaCross(periodFast, periodSlow);

    return kLineDataList.map(emaCross.next);
  },
});
