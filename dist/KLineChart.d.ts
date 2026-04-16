import { PropsWithChildren } from "react";
import "./indicators";
import "./overlays";
import "./style.css";
type Token = {
    id: number;
    symbol: string;
    default_trade_group_id?: number;
    price_precision?: number;
};
type Props = {
    token?: Token;
    chartSettingName: string;
    height?: number;
    enableRealTime?: boolean;
    timeEndLoader?: number;
};
export declare function KLineChart({ chartSettingName, token, children, timeEndLoader, height, enableRealTime, }: PropsWithChildren<Props>): import("react/jsx-runtime").JSX.Element;
export {};
