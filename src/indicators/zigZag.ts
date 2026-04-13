import {
  getFigureClass,
  Indicator,
  KLineData,
  registerIndicator,
} from "klinecharts";

type ZigZagValue = {
  price: number;
};

export class Point {
  constructor(
    public price: number,
    public index: number,
    public isHigh: boolean
  ) {}

  public isMorePrice(point: Point, prevPoint: Point): boolean {
    const m = this.isHigh ? 1 : -1;
    return point.price * m > prevPoint.price * m;
  }
}

export class ZigZag {
  private highPrices: number[];
  private lowPrices: number[];
  lastPoint: Point | undefined;
  points: Point[];
  endPoint: Point | undefined;
  private index: number;
  private start: Point | undefined;
  private end: Point | undefined;

  constructor(
    private deviationThreshold: number,
    private depth: number
  ) {
    this.highPrices = [];
    this.lowPrices = [];
    this.points = [];
    this.index = 0;
  }

  private findPivotPoint(prices: number[], isHigh: boolean): Point | undefined {
    const length = Math.max(2, Math.floor(this.depth / 2));
    const pivotPrice = prices[prices.length - length];
    let isFound = true;

    for (let i = 0; i < length - 1; i++) {
      if (
        (isHigh && prices[prices.length - i] > pivotPrice) ||
        (!isHigh && prices[prices.length - i] < pivotPrice)
      ) {
        isFound = false;
        break;
      }
    }

    for (let i = length; i < length * 2; i++) {
      if (
        (isHigh && prices[prices.length - i] > pivotPrice) ||
        (!isHigh && prices[prices.length - i] < pivotPrice)
      ) {
        isFound = false;
        break;
      }
    }

    if (isFound) {
      return new Point(pivotPrice, this.index - length + 1, isHigh);
    }

    return;
  }

  private newPivotPointFound(isHight: boolean, point: Point): boolean {
    if (!this.lastPoint) {
      this.lastPoint = point;
      return true;
    }

    if (this.lastPoint.isHigh === isHight) {
      if (this.endPoint && this.lastPoint.isMorePrice(point, this.endPoint)) {
        this.updatePoint(point);
        return false;
      }
    } else {
      const dev = this.calculateDeviation(this.lastPoint.price, point.price);
      if (
        (!this.lastPoint.isHigh && dev >= this.deviationThreshold) ||
        (this.lastPoint.isHigh && dev <= -this.deviationThreshold)
      ) {
        this.points.push(this.lastPoint);
        this.lastPoint = point;
        return true;
      }
    }

    return false;
  }

  private tryFindPivot(prices: number[], isHight: boolean) {
    const newPoint = this.findPivotPoint(prices, isHight);

    return newPoint ? this.newPivotPointFound(isHight, newPoint) : false;
  }

  private calculateDeviation(base: number, value: number): number {
    return (100 * (value - base)) / Math.abs(base);
  }

  private updatePoint(newPoint: Point): void {
    if (!this.lastPoint) {
      this.lastPoint = newPoint;
    }

    if (this.lastPoint.isHigh !== newPoint.isHigh) {
      this.lastPoint = newPoint;
    }

    if (
      (this.lastPoint.isHigh && this.lastPoint.price < newPoint.price) ||
      (!this.lastPoint.isHigh && this.lastPoint.price > newPoint.price)
    ) {
      this.lastPoint = newPoint;
    }
  }

  next(input: KLineData): undefined | Point {
    this.highPrices.push(input.high);
    this.lowPrices.push(input.low);

    if (this.highPrices.length < this.depth) {
      this.index += 1;
      return;
    }

    const lastPoint = this.lastPoint;
    const somethingChanged =
      this.tryFindPivot(this.highPrices, true) ||
      this.tryFindPivot(this.lowPrices, false);

    this.endPoint = new Point(
      input.close,
      this.index,
      this.lastPoint?.isHigh || true
    );

    this.index += 1;

    if (somethingChanged && lastPoint) {
      return lastPoint;
    }

    return undefined;
  }

  public getPoints(): Point[] {
    return this.points;
  }
}

registerIndicator({
  name: "ZigZag",
  calcParams: [1.5, 10],
  precision: 12,
  calc: (
    kLineDataList: KLineData[],
    indicator: Indicator<ZigZagValue | undefined, number>
  ) => {
    const [threshold, depth] = indicator.calcParams;
    const nextZigZag = new ZigZag(threshold, depth);
    const result: (ZigZagValue | undefined)[] = Array.from({
      length: kLineDataList.length,
    });

    kLineDataList.forEach((kLineData) => {
      const nextPrice = nextZigZag.next(kLineData);

      if (nextPrice) {
        result[nextPrice.index] = { price: nextPrice.price };
      }
    });

    if (nextZigZag.lastPoint) {
      result[nextZigZag.lastPoint.index] = {
        price: nextZigZag.lastPoint.price,
      };
    }
    if (nextZigZag.endPoint) {
      result[nextZigZag.endPoint.index] = {
        price: nextZigZag.endPoint.price,
      };
    }
    return result;
  },
  draw: ({ ctx, chart, indicator, xAxis, yAxis }) => {
    const { from, to } = chart.getVisibleRange();
    const defaultStyles = chart.getStyles().indicator;
    const coordinates = [];
    const { result } = indicator;
    const Figure = getFigureClass("line");
    if (!Figure) {
      return false;
    }

    for (let i = from - 1; i > 0; i--) {
      const data = result[i];
      if (data) {
        coordinates.push({
          x: xAxis.convertToPixel(i),
          y: yAxis.convertToPixel(data.price),
        });
        break;
      }
    }

    for (let i = from; result.length > i; i++) {
      const data = result[i];
      if (data) {
        coordinates.push({
          x: xAxis.convertToPixel(i),
          y: yAxis.convertToPixel(data.price),
        });

        if (i > to && coordinates.length > 2) {
          break;
        }
      }
    }

    new Figure({
      name: "line",
      attrs: [{ coordinates }],
      styles: { ...defaultStyles.lines[0], size: 2, color: "#2962FF" },
    }).draw(ctx);

    return false;
  },
});
