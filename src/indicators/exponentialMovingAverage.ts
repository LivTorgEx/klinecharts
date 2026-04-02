export class ExponentialMovingAverage {
  private period: number;
  private k: number;
  private current: number = 0;
  private isNew: boolean = true;

  constructor(period: number) {
    this.period = period;
    this.k = 2.0 / (period + 1);
  }

  next(input: number): number {
    if (this.isNew) {
      this.isNew = false;
      this.current = input;
    } else {
      this.current = this.k * input + (1.0 - this.k) * this.current;
    }
    return this.current;
  }
}
