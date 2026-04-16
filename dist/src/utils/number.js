import { parseServerDate } from "./date";
export function formatNum(amount, precision = 0) {
    const roundedAmount = amount.toFixed(precision);
    const parts = roundedAmount.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
export function toMeasurePrice(prev_price, price) {
    return ((price - prev_price) * 100) / prev_price;
}
export function roundToNearestPrice(price, interval = 1) {
    return Math.ceil(price / interval) * interval;
}
export function toChartY(price, zeroPrice, gapY) {
    return (zeroPrice - price) / gapY;
}
export function toChartX(time, timeStart, timeframe, gapBar) {
    const timeNum = typeof time === "string" ? parseServerDate(time).getTime() : time;
    return ((timeNum - timeStart) / (timeframe * 1000)) * gapBar;
}
export function format_tf(value) {
    var _a;
    const tf = typeof value === "number" ? value : ((_a = parseInputInt(value)) !== null && _a !== void 0 ? _a : 0);
    if (tf < 3600) {
        return `${(tf / 60).toFixed(0)}m`;
    }
    return `${(tf / 3600).toFixed(0)}h`;
}
export function formatBigNumber(volume, unit = "₮") {
    const val = Math.abs(volume);
    if (val === 0) {
        return "";
    }
    else if (val > 1000000) {
        return (volume / 1000000).toFixed(2) + `m${unit}`;
    }
    else if (val > 1000) {
        return (volume / 1000).toFixed(2) + `k${unit}`;
    }
    else if (val < 1) {
        return volume.toFixed(4) + unit;
    }
    else if (val < 10) {
        return volume.toFixed(2) + unit;
    }
    else {
        return volume.toFixed(0) + unit;
    }
}
export function parseInputFloat(value, initial = null) {
    try {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? initial : parsedValue;
    }
    catch {
        return initial;
    }
}
export function parseInputInt(value) {
    try {
        const parsedValue = parseInt(value);
        return isNaN(parsedValue) ? null : parsedValue;
    }
    catch {
        return null;
    }
}
