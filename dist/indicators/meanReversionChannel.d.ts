import { KLineData } from "klinecharts";
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
export declare class MeanReversionChannel {
    private ss;
    private tr;
    private meanRange;
    private inner;
    private small;
    private outer;
    private big;
    constructor(period: number, inner: number, small: number, outer: number, big: number);
    next(input: KLineData): MeanReversionChannelValue;
}
export {};
