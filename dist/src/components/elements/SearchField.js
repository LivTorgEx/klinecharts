import { jsx as _jsx } from "react/jsx-runtime";
export const SearchField = ({ onChange, fullWidth: _fullWidth, delay: _delay, ...restProps }) => (_jsx("input", { ...restProps, onChange: onChange ? (e) => onChange(e.target.value) : undefined }));
export default SearchField;
