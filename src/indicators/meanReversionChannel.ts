import { KLineData, registerIndicator } from "klinecharts";
import { TrueRange } from "./trueRange";
import { Supersmoother } from "./supersmoother";

type MeanReversionChannelValue = {
  meanLine: number;
  upInner: number;
  upSmall: number;
  upOuter: number;
  upBig: number;
  downInner: number;
  downSmall: number;
  downOuter: number;
  downBig: number;
};

export class MeanReversionChannel {
  private ss: Supersmoother;
  private tr: TrueRange;
  private meanRange: Supersmoother;
  private inner: number;
  private small: number;
  private outer: number;
  private big: number;

  constructor(
    period: number,
    inner: number,
    small: number,
    outer: number,
    big: number
  ) {
    this.ss = new Supersmoother(period);
    this.tr = new TrueRange();
    this.meanRange = new Supersmoother(period);
    this.inner = inner * Math.PI;
    this.small = small * Math.PI;
    this.outer = outer * Math.PI;
    this.big = big * Math.PI;
  }

  next(input: KLineData): MeanReversionChannelValue {
    const source = (input.high + input.low + input.close) / 3;
    const meanLine = this.ss.next(source);
    const meanRange = this.meanRange.next(this.tr.next(input));

    return {
      meanLine,
      upInner: meanLine + meanRange * this.inner,
      upSmall: meanLine + meanRange * this.small,
      upOuter: meanLine + meanRange * this.outer,
      upBig: meanLine + meanRange * this.big,
      downInner: meanLine - meanRange * this.inner,
      downSmall: meanLine - meanRange * this.small,
      downOuter: meanLine - meanRange * this.outer,
      downBig: meanLine - meanRange * this.big,
    };
  }
}

registerIndicator<MeanReversionChannelValue, number>({
  name: "MRC",
  calcParams: [200, 1, 1.77, 2.415, 3.04],
  figures: [
    {
      key: "meanLine",
      title: "Line:",
      type: "line",
      styles: () => ({ color: "#f4c730", size: 2 }),
    },
    {
      key: "upBig",
      type: "line",
      styles: () => ({ color: "rgba(255, 82, 82, 0.4)", size: 1 }),
    },
    {
      key: "upOuter",
      type: "line",
      styles: () => ({ color: "rgba(255, 82, 82, 0.6)", size: 2 }),
    },
    {
      key: "upSmall",
      type: "line",
      styles: () => ({ color: "rgba(255, 82, 82, 0.4)", size: 1 }),
    },
    {
      key: "upInner",
      type: "line",
      styles: () => ({ color: "rgba(255, 82, 82, 0.8)", size: 2 }),
    },
    {
      key: "downInner",
      type: "line",
      styles: () => ({ color: "rgba(76, 175, 80, 0.6)", size: 2 }),
    },
    {
      key: "downSmall",
      type: "line",
      styles: () => ({ color: "rgba(76, 175, 80, 0.4)", size: 1 }),
    },
    {
      key: "downOuter",
      type: "line",
      styles: () => ({ color: "rgba(76, 175, 80, 0.8)", size: 2 }),
    },
    {
      key: "downBig",
      type: "line",
      styles: () => ({ color: "rgba(76, 175, 80, 0.4)", size: 1 }),
    },
  ],
  precision: 12,
  calc: (kLineDataList, indicator) => {
    const [period, inner, small, outer, big] = indicator.calcParams as number[];
    const nextAtr = new MeanReversionChannel(period, inner, small, outer, big);

    return kLineDataList.map((kLineData) => nextAtr.next(kLineData));
  },
});
