import { KLineData } from "klinecharts";
export declare class RelativeStrengthIndex {
    private up;
    private down;
    private prevValue?;
    constructor(period: number);
    next(input: KLineData): number;
}
