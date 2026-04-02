import { KLineData, registerIndicator } from "klinecharts";

/// The range of a day's trading is simply _high_ - _low_.
/// The true range extends it to yesterday's closing price if it was outside of today's range.
///
/// The true range is the largest of one the following:
///
/// * Most recent period's high minus the most recent period's low
/// * Absolute value of the most recent period's high minus the previous close
/// * Absolute value of the most recent period's low minus the previous close
///
/// # Formula
///
/// TR = max[(high - low), abs(high - close<sub>prev</sub>), abs(low - close<sub>prev</sub>)]
///

export class TrueRange {
  private prevClose?: number;

  constructor() {}

  private nextDistance(input: number | KLineData): number {
    if (typeof input === "number") {
      return this.prevClose ? Math.abs(input - this.prevClose) : 0;
    }

    if (this.prevClose === undefined) {
      return input.high - input.low;
    }

    return Math.max(
      input.high - input.low,
      Math.abs(input.high - this.prevClose),
      Math.abs(input.low - this.prevClose)
    );
  }

  next(input: number | KLineData): number {
    const distance = this.nextDistance(input);

    if (typeof input === "number") {
      this.prevClose = input;
    } else {
      this.prevClose = input.close;
    }

    return distance;
  }
}

registerIndicator({
  name: "TR",
  precision: 12,
  figures: [{ key: "tr", title: "Tr: ", type: "line" }],
  calc: (kLineDataList: KLineData[]) => {
    const nextAtr = new TrueRange();

    return kLineDataList.map((kLineData) => ({
      tr: nextAtr.next(kLineData),
    }));
  },
});
