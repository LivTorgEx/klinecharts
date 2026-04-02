export type ChartSettingVariant = "projection" | "position";
export type Props<V extends ChartSettingVariant> = {
    variant: V;
    name: string;
    onClose(): void;
};
export declare function KLineChartSettingsModal<V extends ChartSettingVariant>({ variant, name, onClose, }: Props<V>): any;
