import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { KLineData, NeighborData, OverlayCreate } from "klinecharts";

import { useBacktestRunDebug } from "../hooks/api/backtest/backtestRunHooks";
import { useChart } from "../context/chart";
import { Box, Typography } from "@mui/material";
import { DATETIME_UI } from "../constants/date";
import { format } from "date-fns";

type Props = {
  backtestRunId: number;
};

export function KLineChartLoadDebug({ backtestRunId }: Props) {
  const { t } = useTranslation();
  const chart = useChart();

  const [selectedTime, setSelectedTime] = useState<number | undefined>();
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const {
    data: backtestRunTimeInfos,
    refetch: handleLoadDebug,
    isLoading: isLoadingDebug,
    isSuccess: isSuccessDebug,
  } = useBacktestRunDebug(backtestRunId);
  const timeInfo = selectedTime
    ? backtestRunTimeInfos?.[selectedTime]
    : undefined;

  useEffect(() => {
    if (!chart) {
      return;
    }

    const handeChange = (data: unknown) => {
      const { data: info } = data as { data: NeighborData<KLineData> };
      setSelectedTime(info.current.timestamp);
      setSelectedPrice(info.current.open);
    };

    chart.subscribeAction("onCandleBarClick", handeChange);

    return () => {
      chart.unsubscribeAction("onCandleBarClick", handeChange);
    };
  }, [chart]);
  useEffect(() => {
    if (!chart || !backtestRunTimeInfos) {
      return;
    }

    const existingSignalKeys = new Set<string>();

    Object.values(backtestRunTimeInfos).forEach((timeInfo) => {
      timeInfo.signals.forEach(({ price, time, message }) => {
        const id = `${time}_${price}`;
        const points: OverlayCreate["points"] = [
          {
            timestamp: time,
            value: price,
          },
        ];
        chart.createOverlay({
          name: "debugSignal",
          id,
          points,
          extendData: { message },
        });
        existingSignalKeys.add(id);
      });
    });

    return () => {
      existingSignalKeys.forEach((id) => {
        chart.removeOverlay({ id });
      });
    };
  }, [backtestRunTimeInfos, chart]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "ArrowLeft") {
        setSelectedTime((prev) => (prev ? prev - 1000 : prev));
      }
      if (event.code === "ArrowRight") {
        setSelectedTime((prev) => (prev ? prev + 1000 : prev));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!chart || !timeInfo) {
      return;
    }

    const existingKeys = new Set<string>();

    if (selectedTime && selectedPrice) {
      const lineId = "draw_time";
      chart.createOverlay({
        name: "verticalStraightLine",
        id: lineId,
        lock: true,
        points: [{ timestamp: selectedTime, value: selectedPrice }],
      });
      existingKeys.add(lineId);
    }

    timeInfo.draws.forEach((draw, idx) => {
      const id = `draw_${draw.variant}_${idx}`;

      switch (draw.variant) {
        case "Box":
          chart.createOverlay({
            name: "measure",
            id,
            lock: true,
            styles: {
              backgroundColor: draw.color,
            },
            extendData: {
              messages: draw.title?.split("\n"),
            },
            points: [
              {
                timestamp: draw.start_time,
                value:
                  draw.direction === "LONG" ? draw.price_min : draw.price_max,
              },
              {
                timestamp: draw.end_time,
                value:
                  draw.direction === "LONG" ? draw.price_max : draw.price_min,
              },
            ],
          });
          break;
        default:
          return;
      }

      existingKeys.add(id);
    });

    return () => {
      existingKeys.forEach((id) => {
        chart.removeOverlay({ id });
      });
    };
  }, [timeInfo, chart, selectedTime, selectedPrice]);

  if (!backtestRunTimeInfos) {
    return (
      <LoadingButton
        size="small"
        variant="outlined"
        onClick={() => handleLoadDebug()}
        loading={isLoadingDebug}
        disabled={isSuccessDebug}
      >
        {t("load_debug")}
      </LoadingButton>
    );
  }

  return (
    <Box sx={{
      height: "128px"
    }}>
      {selectedTime && (
        <Typography variant="body2" component="p">
          {format(selectedTime, DATETIME_UI)}
        </Typography>
      )}
      {timeInfo?.messages.map((msg, idx) => (
        <Typography variant="body2" component="p" key={idx}>
          {msg}
        </Typography>
      ))}
    </Box>
  );
}
