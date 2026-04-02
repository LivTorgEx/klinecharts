export declare class ExponentialMovingAverage {
    private period;
    private k;
    private current;
    private isNew;
    constructor(period: number);
    next(input: number): number;
}
