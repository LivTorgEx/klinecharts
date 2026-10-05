import {
  DeepPartial,
  IndicatorCreateTooltipDataSourceParams,
  IndicatorStyle,
  IndicatorTooltipData,
} from "klinecharts";

export const createTooltipDataSource = ({
  indicator,
  chart,
}: IndicatorCreateTooltipDataSourceParams<unknown>): IndicatorTooltipData => {
  const defaultStyles = chart.getStyles().indicator;
  const features = [
    indicator.visible
      ? defaultStyles.tooltip.features[1]
      : defaultStyles.tooltip.features[0],
    ...(indicator.calcParams.length > 0
      ? [defaultStyles.tooltip.features[2]]
      : []),
    defaultStyles.tooltip.features[3],
  ];
  return {
    features,
    name: indicator.name,
    calcParamsText:
      indicator.calcParams.length > 0
        ? `(${indicator.calcParams.join(", ")})`
        : "",
    legends: [],
  };
};
export const getIndicatorStyles = (
  color: string
): DeepPartial<IndicatorStyle> => ({
  tooltip: {
    features: [
      {
        id: "visible",
        position: "middle",
        marginLeft: 0,
        marginTop: 2,
        marginRight: 0,
        marginBottom: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        type: "path",
        content: {
          path: "M1 7C2.6 3.9 4.6 2.2 7 2.2C9.4 2.2 11.4 3.9 13 7C11.4 10.1 9.4 11.8 7 11.8C4.6 11.8 2.6 10.1 1 7ZM7 4.4C5.6 4.4 4.4 5.6 4.4 7C4.4 8.4 5.6 9.6 7 9.6C8.4 9.6 9.6 8.4 9.6 7C9.6 5.6 8.4 4.4 7 4.4Z",
          style: "stroke",
          lineWidth: 1.4,
        },
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
      },
      {
        id: "invisible",
        position: "middle",
        marginLeft: 0,
        marginTop: 2,
        marginRight: 0,
        marginBottom: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        type: "path",
        content: {
          path: "M1 7C2.6 3.9 4.6 2.2 7 2.2C9.4 2.2 11.4 3.9 13 7C11.4 10.1 9.4 11.8 7 11.8C4.6 11.8 2.6 10.1 1 7ZM2 1L12 13",
          style: "stroke",
          lineWidth: 1.4,
        },
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
      },
      {
        id: "edit",
        position: "middle",
        marginLeft: 4,
        marginTop: 2,
        marginBottom: 0,
        marginRight: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        type: "path",
        content: {
          path: "M2 10.8L2.4 13L4.6 12.6L11.8 5.4L9.6 3.2L2.4 10.4M8.8 4L11 6.2",
          style: "stroke",
          lineWidth: 1.4,
        },
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
      },
      {
        id: "close",
        position: "middle",
        marginLeft: 4,
        marginTop: 2,
        marginRight: 0,
        marginBottom: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        type: "path",
        content: {
          path: "M3 3L11 11M11 3L3 11",
          style: "stroke",
          lineWidth: 1.5,
        },
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
      },
    ],
  },
});
