export type PositionOrder = {
    id?: number | string;
    price: number;
    qty: number;
    side: "buy" | "sell" | string;
    created_at?: string;
    order_type?: string;
    stop_price?: number;
    update_at?: string;
    client_id?: number | string;
    original_id?: number | string;
    notes?: Array<{
        [property: string]: string | number | boolean;
    }>;
    status?: string;
    qty_filled?: number;
};
export type PositionOrderType = "MARKET" | "LIMIT" | "STOP_MARKET" | "STOP_LIMIT" | string;
export declare const PositionOrderType: {
    readonly Market: "MARKET";
    readonly Limit: "LIMIT";
    readonly StopMarket: "STOP_MARKET";
    readonly StopLimit: "STOP_LIMIT";
};
export declare const OrderDirection: {
    readonly LONG: "LONG";
    readonly SHORT: "SHORT";
    readonly BOTH: "BOTH";
};
export type OrderDirection = (typeof OrderDirection)[keyof typeof OrderDirection];
