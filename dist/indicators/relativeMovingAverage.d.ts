export declare class RelativeMovingAverage {
    private k;
    private current;
    private isNew;
    constructor(period: number);
    next(input: number): number;
}
