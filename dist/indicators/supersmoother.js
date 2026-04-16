import { Stack } from "./stack";
export class Supersmoother {
    constructor(period) {
        this.period = period;
        this.srcStack = new Stack(2);
        this.ssStack = new Stack(2);
    }
    next(src) {
        const s_a1 = Math.exp((-Math.sqrt(2) * Math.PI) / this.period);
        const s_b1 = 2 * s_a1 * Math.cos((Math.sqrt(2) * Math.PI) / this.period);
        const s_c3 = -Math.pow(s_a1, 2);
        const s_c2 = s_b1;
        const s_c1 = 1 - s_c2 - s_c3;
        const ss = s_c1 * src +
            s_c2 * this.ssStack.nz(0, this.srcStack.get(0)) +
            s_c3 * this.ssStack.nz(1, this.srcStack.get(1));
        this.srcStack.next(src);
        this.ssStack.next(ss);
        return ss;
    }
}
