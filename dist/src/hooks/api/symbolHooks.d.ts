import type { SymbolType } from "../../types/client/symbol";
export declare function useSymbol(id?: number): SymbolType | undefined;
export declare function useSymbols(): {
    data: SymbolType[];
};
export declare function useSymbolFromAll(id?: number): SymbolType | undefined;
export declare function useSymbolsAll(): {
    data: SymbolType[];
};
