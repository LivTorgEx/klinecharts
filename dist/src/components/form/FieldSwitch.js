import { jsx as _jsx } from "react/jsx-runtime";
export const FieldSwitch = ({ label: _label, onChange, value, checked, name, onBlur, disabled }) => (_jsx("label", { children: _jsx("input", { type: "checkbox", name: name, checked: typeof checked !== "undefined" ? checked : Boolean(value), disabled: disabled, onBlur: onBlur, onChange: (e) => onChange === null || onChange === void 0 ? void 0 : onChange(e.target.checked) }) }));
export default FieldSwitch;
