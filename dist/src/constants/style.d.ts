import { DeepPartial, IndicatorCreateTooltipDataSourceParams, IndicatorStyle, IndicatorTooltipData } from "klinecharts";
export declare const createTooltipDataSource: ({ indicator, chart, }: IndicatorCreateTooltipDataSourceParams<unknown>) => IndicatorTooltipData;
export declare const getIndicatorStyles: (color: string) => DeepPartial<IndicatorStyle>;
