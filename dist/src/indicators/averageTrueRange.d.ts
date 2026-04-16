import { KLineData } from "klinecharts";
export declare class AverageTrueRange {
    private trueRange;
    private rma;
    constructor(period: number);
    next(input: number | KLineData): number;
}
