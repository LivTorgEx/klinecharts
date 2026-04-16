export function useSymbol(id) {
    // stub: return undefined or minimal symbol
    void id;
    return undefined;
}
export function useSymbols() {
    return { data: [] };
}
export function useSymbolFromAll(id) {
    return useSymbol(id);
}
export function useSymbolsAll() {
    return useSymbols();
}
