import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Settings, SettingsInputComposite, } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loadChartSettings, partialUpdateChartSettings, } from "../utils/chart";
import { KLineChartProjectionSettings } from "./KLineChartProjectionSettings";
import { KLineChartPositionSettings } from "./KLineChartPositionSettings";
const Icons = {
    projection: Settings,
    position: SettingsInputComposite,
};
export function KLineChartSettingsModal({ variant, name, onClose, }) {
    const form = useForm();
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => {
        const values = loadChartSettings(name)[variant];
        form.reset(values);
        setIsOpen(true);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = (values) => {
        partialUpdateChartSettings(name, { [variant]: values });
        handleClose();
    };
    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };
    const Icon = Icons[variant];
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: handleOpen, size: "small", children: _jsx(Icon, { fontSize: "small" }) }), _jsx(Dialog, { open: isOpen, onClose: handleClose, fullWidth: true, maxWidth: "sm", children: _jsxs("form", { onSubmit: form.handleSubmit(handleSave), children: [_jsxs(DialogTitle, { children: ["Settings for ", variant] }), _jsxs(DialogContent, { children: [variant === "projection" && (_jsx(KLineChartProjectionSettings, { control: form.control })), variant === "position" && (_jsx(KLineChartPositionSettings, { control: form.control }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleClose, children: "Cancel" }), _jsx(Button, { type: "submit", children: "Save" })] })] }) })] }));
}
