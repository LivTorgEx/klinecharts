interface KLineChartWorkerPositionsContentProps {
    workerIdsArray: number[];
    symbolId: number;
    tokenName: string;
    showPositions: boolean;
}
/**
 * Reusable component for displaying finished and active positions on a chart.
 * Handles fetching completed positions and rendering them alongside active positions.
 */
export declare function KLineChartWorkerPositionsContent({ workerIdsArray, symbolId, tokenName, showPositions, }: KLineChartWorkerPositionsContentProps): any;
export {};
