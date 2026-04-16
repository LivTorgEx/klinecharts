type SwitchProps = {
    label?: string;
    onChange?: (value: boolean) => void;
    onBlur?: () => void;
    checked?: boolean;
    value?: boolean;
    name?: string;
    disabled?: boolean;
};
export declare const FieldSwitch: ({ label: _label, onChange, value, checked, name, onBlur, disabled }: SwitchProps) => import("react/jsx-runtime").JSX.Element;
export default FieldSwitch;
