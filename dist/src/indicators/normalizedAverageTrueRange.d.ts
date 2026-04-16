import { KLineData } from "klinecharts";
type NormalizedAverageTrueRangeValue = {
    natr: number;
    drop: number;
    gain: number;
};
export declare class NormalizedAverageTrueRange {
    private atr;
    private max;
    private min;
    constructor(period: number);
    next(input: number | KLineData): NormalizedAverageTrueRangeValue;
}
export {};
