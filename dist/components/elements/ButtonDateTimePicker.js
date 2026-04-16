import { jsx as _jsx } from "react/jsx-runtime";
export const ButtonDateTimePicker = ({ onAccept, children }) => (_jsx("input", { type: "datetime-local", title: typeof children === "string" ? children : undefined, onChange: (e) => onAccept?.(e.target.value ? new Date(e.target.value) : null) }));
export default ButtonDateTimePicker;
