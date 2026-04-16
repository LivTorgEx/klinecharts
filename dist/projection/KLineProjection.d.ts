type Props = {
    tokenName: string;
    symbolId: number;
    timeframe: number;
    selectedTime?: number;
    clearSelectedTime(): void;
};
export declare function KLineProjection({ tokenName, symbolId, timeframe, selectedTime, clearSelectedTime, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
