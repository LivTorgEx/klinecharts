import {
  getFigureClass,
  Indicator,
  KLineData,
  registerIndicator,
} from "klinecharts";
import { ZigZag, Point } from "./zigZag";
import { OrderDirection } from "../../types/client/order";
import { getRayLine } from "../helper/getRayLine";

type ZigZagLineValue = {
  coordinatePoints: Point[];
  lastPoint: Point;
  direction: OrderDirection;
  points: Point[];
};

registerIndicator({
  name: "ZigZagLine",
  calcParams: [1.5, 10],
  precision: 12,
  calc: (
    kLineDataList: KLineData[],
    indicator: Indicator<ZigZagLineValue, number>
  ) => {
    const [threshold, depth] = indicator.calcParams;
    const nextZigZag = new ZigZag(threshold, depth);
    const points: Point[] = [];
    const result: ZigZagLineValue[] = [];

    kLineDataList.forEach((kLineData) => {
      const nextPrice = nextZigZag.next(kLineData);

      if (nextPrice) {
        points.push(nextPrice);
      }
    });

    if (points.length < 4) {
      return result;
    }

    if (nextZigZag.lastPoint) {
      points.push(nextZigZag.lastPoint);
    }

    let lastPoint = nextZigZag.endPoint;

    // points.reverse();
    while (lastPoint && points.length > 5) {
      const lastIdx = points.length - 1;
      const isTrend =
        (lastPoint.isHigh &&
          points[lastIdx - 1].price < lastPoint.price &&
          points[lastIdx - 2].price < points[lastIdx].price) ||
        (!lastPoint.isHigh &&
          points[lastIdx - 1].price > lastPoint.price &&
          points[lastIdx - 2].price > points[lastIdx].price);

      if (!isTrend) {
        lastPoint = points.pop();
        continue;
      }

      const secondPoint = points[lastIdx];
      const firstPoint = points[lastIdx - 2];
      const direction =
        firstPoint.price < secondPoint.price
          ? OrderDirection.LONG
          : OrderDirection.SHORT;

      // if (result.length && result[result.length - 1].direction === direction) {
      //   result.pop();
      // }
      result.push({
        coordinatePoints: [firstPoint, secondPoint],
        lastPoint,
        direction,
        points: points.slice(lastIdx - 4, lastIdx),
      });

      lastPoint = points.pop();
    }

    return result;
  },
  draw: ({ ctx, indicator, bounding, xAxis, yAxis, chart }) => {
    const { from, to } = chart.getVisibleRange();
    const defaultStyles = chart.getStyles().indicator;
    const { result } = indicator;
    const FigureLine = getFigureClass("line")!;
    const FigureCircle = getFigureClass("circle")!;
    const FigureText = getFigureClass("text")!;

    result
      .filter(({ coordinatePoints }) =>
        coordinatePoints.some(({ index }) => index >= from && index <= to)
      )
      .forEach((line) => {
        const coordinates = line.coordinatePoints.map((point) => ({
          x: xAxis.convertToPixel(point.index),
          y: yAxis.convertToPixel(point.price),
        }));

        new FigureLine({
          name: "line",
          attrs: getRayLine(coordinates, bounding),
          styles: {
            ...defaultStyles.lines[0],
            style: "dashed",
            size: 1,
            dashedValue: [2, 4],
          },
        }).draw(ctx);
        new FigureCircle({
          name: "circle",
          attrs: coordinates.map(({ x, y }) => ({ x, y, r: 5 }))[0],
          styles: {
            ...defaultStyles.circles[0],
            color: line.direction === OrderDirection.LONG ? "green" : "red",
          },
        }).draw(ctx);
        new FigureText({
          name: "text",
          attrs: {
            text: line.direction,
            ...coordinates[0],
          },
          styles: {
            color: defaultStyles.lines[0].color,
            size: 10,
          },
        }).draw(ctx);
      });

    return false;
  },
});
