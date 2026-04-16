import { KLineData } from "klinecharts";
export declare class TrueRange {
    private prevClose?;
    constructor();
    private nextDistance;
    next(input: number | KLineData): number;
}
