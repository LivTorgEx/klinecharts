import { KLineData, registerIndicator } from "klinecharts";

import { AverageTrueRange } from "./averageTrueRange";
import { Maximum } from "./maximum";
import { Minimum } from "./minimum";
import { OrderDirection } from "../types/client/order";

type ChandelierExitOutput = {
  long: number;
  short: number;
};
type ChandelierExitValue = {
  ceLong?: number;
  ceShort?: number;
  direction: OrderDirection;
  long: number;
  short: number;
};

class ChandelierExit {
  private atr: AverageTrueRange;
  private min: Minimum;
  private max: Maximum;

  constructor(
    private period: number,
    private multiplier: number
  ) {
    this.atr = new AverageTrueRange(period);
    this.min = new Minimum(period);
    this.max = new Maximum(period);
  }

  next(input: KLineData): ChandelierExitOutput {
    const atr = this.atr.next(input) * this.multiplier;
    const min = this.min.next(input);
    const max = this.max.next(input);

    return {
      long: max - atr,
      short: min + atr,
    };
  }
}

registerIndicator<ChandelierExitValue, number>({
  name: "CE",
  precision: 12,
  calcParams: [22, 3],
  figures: [
    {
      key: "ceLong",
      title: "Long: ",
      type: "line",
      styles: ({ defaultStyles }) => {
        return { color: defaultStyles!.circles[0].upColor, size: 2 };
      },
    },
    {
      key: "ceShort",
      title: "Short: ",
      type: "line",
      styles: ({ defaultStyles }) => {
        return { color: defaultStyles!.circles[0].downColor, size: 2 };
      },
    },
  ],
  calc: (kLineDataList, indicator) => {
    const [period, multiplier] = indicator.calcParams;
    const nextCE = new ChandelierExit(period, multiplier);

    let prevValue: ChandelierExitValue | undefined = undefined;

    return kLineDataList.map((input): ChandelierExitValue => {
      const value = nextCE.next(input);

      const long = prevValue?.long ?? value.long;
      const short = prevValue?.short ?? value.short;

      let direction: OrderDirection = prevValue?.direction ?? OrderDirection.BOTH;

      if (input.close > short) {
        direction = OrderDirection.LONG;
      } else if (input.close < long) {
        direction = OrderDirection.SHORT;
      }

      prevValue = {
        ...value,
        ceLong: direction === OrderDirection.LONG ? value.long : undefined,
        ceShort: direction === OrderDirection.SHORT ? value.short : undefined,
        direction,
      };
      return prevValue;
    });
  },
});
