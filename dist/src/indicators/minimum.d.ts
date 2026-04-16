import { KLineData } from "klinecharts";
export declare class Minimum {
    private period;
    private minIndex;
    private curIndex;
    private deque;
    constructor(period: number);
    findMinIndex(): number;
    next(input: number | KLineData): number;
}
