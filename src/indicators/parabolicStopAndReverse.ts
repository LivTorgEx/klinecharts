import { KLineData, registerIndicator, utils } from "klinecharts";

type ParabolicStopAndReverseValue = {
  pSAR: number;
  high: number;
  low: number;
};

export class ParabolicStopAndReverse {
  private af: number; // Current Acceleration Factor
  private maxAf: number; // Maximum Acceleration Factor
  private afStep: number; // Increment step of the Acceleration Factor
  private isUptrend: boolean = true; // Whether the current trend is up
  private sar: number = 0.0; // Current SAR value
  private ep: number = 0.0; // Extreme point (highest high or lowest low)

  constructor(
    private start: number,
    private increment: number,
    private maximum: number
  ) {
    this.af = start; // Starting acceleration factor
    this.maxAf = maximum; // Maximum AF value
    this.afStep = increment; // Increment for AF
  }

  initializeWithCandle(input: KLineData): number {
    // Determine initial trend based on the close relative to the range
    this.isUptrend = input.close > (input.high + input.low) / 2.0; // Uptrend if close is above the midpoint

    // Set initial SAR and EP based on the trend
    if (this.isUptrend) {
      this.sar = input.low; // SAR starts at the lowest low in an uptrend
      this.ep = input.high; // Extreme Point (EP) is the highest high in an uptrend
    } else {
      this.sar = input.high; // SAR starts at the highest high in a downtrend
      this.ep = input.low; // Extreme Point (EP) is the lowest low in a downtrend
    }

    return this.sar;
  }

  next(input: KLineData): number {
    // If in uptrend
    if (this.isUptrend) {
      // Update SAR
      this.sar = this.sar + this.af * (this.ep - this.sar);

      if (input.high > this.ep) {
        this.ep = input.high;
        this.af = Math.min(this.af + this.afStep, this.maxAf); // Increment AF, but cap it at maxAf
      }

      // Check if price breaks below SAR -> Switch to downtrend
      if (input.low < this.sar) {
        // Start new downtrend
        this.isUptrend = false;
        this.sar = this.ep; // SAR becomes the previous extreme point (EP)
        this.af = this.start;
        this.ep = input.low; // New extreme point is the current low
      } else {
        // Ensure SAR doesn't exceed the lowest point of the last two lows
        this.sar = Math.min(this.sar, input.low);
      }
    } else {
      // Update SAR for downtrend
      this.sar = this.sar + this.af * (this.ep - this.sar);

      if (input.low < this.ep) {
        this.ep = input.low;
        this.af = Math.min(this.af + this.afStep, this.maxAf); // Increment AF, but cap it at maxAf
      }

      // Check if price breaks above SAR -> Switch to uptrend
      if (input.high > this.sar) {
        // Start new uptrend
        this.isUptrend = true;
        this.sar = this.ep; // SAR becomes the previous extreme point (EP)
        this.af = this.start;
        this.ep = input.high; // New extreme point is the current high
      } else {
        // Ensure SAR doesn't exceed the highest point of the last two highs
        this.sar = Math.max(this.sar, input.high);
      }
    }

    return this.sar;
  }
}

registerIndicator<ParabolicStopAndReverseValue, number>({
  name: "pSAR",
  shortName: "pSAR",
  calcParams: [0.02, 0.02, 0.2],
  series: "price",
  precision: 12,
  shouldOhlc: true,
  figures: [
    {
      key: "pSAR",
      title: "SAR: ",
      type: "circle",
      styles: ({ data, indicator, defaultStyles }) => {
        const { current } = data;
        const sar = current?.pSAR ?? Number.MIN_SAFE_INTEGER;
        const halfHL = ((current?.high ?? 0) + (current?.low ?? 0)) / 2;
        const color =
          sar < halfHL
            ? (utils.formatValue(
                indicator.styles,
                "circles[0].upColor",
                defaultStyles!.circles[0].upColor
              ) as string)
            : (utils.formatValue(
                indicator.styles,
                "circles[0].downColor",
                defaultStyles!.circles[0].downColor
              ) as string);
        return { color };
      },
    },
  ],
  calc: (kLineDataList, indicator) => {
    const [start, increment, maximum] = indicator.calcParams;
    const nextAtr = new ParabolicStopAndReverse(start, increment, maximum);

    return kLineDataList.map((kLineData, idx) => ({
      pSAR:
        idx === 0
          ? nextAtr.initializeWithCandle(kLineData)
          : nextAtr.next(kLineData),
      high: kLineData.high,
      low: kLineData.low,
    }));
  },
});
