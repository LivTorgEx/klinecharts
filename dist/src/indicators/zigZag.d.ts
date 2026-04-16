import { KLineData } from "klinecharts";
export declare class Point {
    price: number;
    index: number;
    isHigh: boolean;
    constructor(price: number, index: number, isHigh: boolean);
    isMorePrice(point: Point, prevPoint: Point): boolean;
}
export declare class ZigZag {
    private deviationThreshold;
    private depth;
    private highPrices;
    private lowPrices;
    lastPoint: Point | undefined;
    points: Point[];
    endPoint: Point | undefined;
    private index;
    private start;
    private end;
    constructor(deviationThreshold: number, depth: number);
    private findPivotPoint;
    private newPivotPointFound;
    private tryFindPivot;
    private calculateDeviation;
    private updatePoint;
    next(input: KLineData): undefined | Point;
    getPoints(): Point[];
}
