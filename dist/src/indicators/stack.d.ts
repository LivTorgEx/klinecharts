export declare class Stack {
    private period;
    private deque;
    constructor(period: number);
    get(idx: number): number | undefined;
    nz(idx: number, defaultValue?: number): number;
    next(input: number): void;
}
