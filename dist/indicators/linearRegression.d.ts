export declare class LinearRegression {
    private period;
    private window;
    constructor(period: number);
    calculate(): number;
    next(value: number): number | undefined;
}
