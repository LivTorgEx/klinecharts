type Props = {
    onQuickAdd: (price: number, isBuy: boolean, position?: {
        x: number;
        y: number;
    }) => void;
};
export declare function KLineChartQuickAddButton({ onQuickAdd }: Props): any;
export {};
