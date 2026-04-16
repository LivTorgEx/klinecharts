export declare class SimpleMovingAverage {
    private period;
    private acc;
    constructor(period: number);
    next(input: number): number;
}
