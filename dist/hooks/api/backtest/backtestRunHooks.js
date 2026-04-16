export function useBacktestRunDebug(_id) {
    return {
        data: undefined,
        isLoading: false,
        refetch: () => Promise.resolve(),
        isSuccess: false,
    };
}
