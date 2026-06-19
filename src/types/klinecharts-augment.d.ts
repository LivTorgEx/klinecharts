import "klinecharts";

declare module "klinecharts" {
  interface KLineData {
    buy?: number;
    sell?: number;
  }
}

export {};
