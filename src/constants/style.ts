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
  const features = [];
  if (indicator.visible) {
    features.push(defaultStyles.tooltip.features[1]);
    // icons.push(defaultStyles.tooltip.features[2]);
    features.push(defaultStyles.tooltip.features[3]);
  } else {
    features.push(defaultStyles.tooltip.features[0]);
    // icons.push(defaultStyles.tooltip.features[2]);
    features.push(defaultStyles.tooltip.features[3]);
  }
  // @ts-expect-error issue in TS. All properties could be empty
  return { features, name: indicator.name };
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
        type: "icon_font",
        content: {
          code: "\ue903",
          family: "icomoon",
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
        type: "icon_font",
        content: {
          code: "\ue901",
          family: "icomoon",
        },
        size: 14,
        color: color,
        activeColor: color,
        backgroundColor: "transparent",
        activeBackgroundColor: "rgba(22, 119, 255, 0.15)",
      },
      {
        id: "setting",
        position: "middle",
        marginLeft: 4,
        marginTop: 2,
        marginBottom: 0,
        marginRight: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        type: "icon_font",
        content: {
          code: "\ue902",
          family: "icomoon",
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
        type: "icon_font",
        content: {
          code: "\ue900",
          family: "icomoon",
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
