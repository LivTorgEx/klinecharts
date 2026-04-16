import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from "react-hook-form";
import { Checkbox, FormControlLabel, Stack } from "@mui/material";
export function KLineChartPositionSettings({ control }) {
    return (_jsx(Stack, { spacing: 0, children: _jsx(Controller, { name: "showFinished", control: control, render: ({ field }) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: field.value, ...field }), label: "Show finished positions" })) }) }));
}
