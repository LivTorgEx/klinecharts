import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFieldArray } from "react-hook-form";
import { Autocomplete, Button, Checkbox, FormControlLabel, IconButton, Stack, TextField, Typography, } from "@mui/material";
import { useState } from "react";
import { Close } from "@mui/icons-material";
import { TRADING_INDICATOR_PROPERTIES } from "../constants/trading";
import { FieldSwitch } from "../components/form/FieldSwitch";
const OPTIONS = [
    { name: "showMessages", label: "Messages" },
    { name: "showLines", label: "Lines" },
    { name: "showMovements", label: "Movements" },
    { name: "showOrderBookLines", label: "Order Book lines" },
];
export function KLineChartProjectionSettings({ control }) {
    const [indicatorName, setIndicatorName] = useState();
    const { append, fields, remove } = useFieldArray({
        name: "indicators",
        control,
    });
    return (_jsxs(Stack, { spacing: 0, children: [OPTIONS.map(({ name, label }) => (_jsx(Controller, { name: name, control: control, render: ({ field }) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: field.value, ...field }), label: `Show ${label}` })) }, name))), _jsxs(Stack, { direction: "row", spacing: 2, sx: {
                    alignItems: "center",
                    mb: 2
                }, children: [_jsx(Autocomplete, { size: "small", sx: { flexGrow: 1 }, disableClearable: true, options: Object.keys(TRADING_INDICATOR_PROPERTIES), renderInput: (params) => (_jsx(TextField, { ...params, margin: "dense", label: "Indicator Name" })), onChange: (event, option) => {
                            setIndicatorName(option);
                        } }), _jsx(Button, { size: "small", variant: "contained", disabled: !indicatorName, onClick: () => {
                            append({ name: indicatorName, properties: {} });
                        }, children: "Add" })] }), fields.map((field, idx) => (_jsxs(Stack, { direction: "row", spacing: 2, sx: {
                    alignItems: "start",
                    mb: 2
                }, children: [_jsxs(Stack, { spacing: 0, sx: {
                            flexGrow: 1
                        }, children: [_jsx(Typography, { children: field.name }), _jsx(Stack, { direction: "row", useFlexGap: true, sx: {
                                    flexWrap: "wrap"
                                }, children: TRADING_INDICATOR_PROPERTIES[field.name]?.map((option) => {
                                    const name = typeof option === "string" ? option : option.value;
                                    const label = typeof option === "string" ? option : option.label;
                                    return (_jsx(Controller, { control: control, name: `indicators.${idx}.properties.${name}`, render: (fieldProps) => (_jsx(FieldSwitch, { label: label, ...fieldProps })) }));
                                }) })] }), _jsx(IconButton, { color: "error", onClick: () => {
                            remove(idx);
                        }, children: _jsx(Close, {}) })] })))] }));
}
