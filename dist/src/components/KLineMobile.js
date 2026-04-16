import { useEffect } from "react";
import { useIsMobile } from "../hooks/ui/useIsMobile";
import { useChart } from "../context/chart";
export function KLineMobile() {
    const chart = useChart();
    const isMobile = useIsMobile();
    useEffect(() => {
        if (!chart) {
            return;
        }
        chart.setStyles({
            candle: {
                tooltip: {
                    showRule: isMobile ? "none" : "always",
                },
            },
            indicator: {
                tooltip: {
                    showRule: isMobile ? "none" : "always",
                },
            },
        });
    }, [chart, isMobile]);
    return null;
}
