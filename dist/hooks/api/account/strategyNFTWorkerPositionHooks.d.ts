type WorkerPositionFilter = {
    status?: string[];
};
type WorkerPaginationParams = {
    page: number;
    page_size: number;
};
type WorkerPositionItem = {
    symbol_id: number;
    bot_id: number;
};
type WorkerPositionsResult = {
    data: WorkerPositionItem[];
};
export declare function useAccountStrategyNFTPositions(_workerId?: number, _filter?: WorkerPositionFilter, _pagination?: WorkerPaginationParams): {
    data: WorkerPositionsResult | undefined;
    isLoading: boolean;
};
export {};
