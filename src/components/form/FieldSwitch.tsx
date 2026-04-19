type SwitchProps = {
  label?: string;
  onChange?: (value: boolean) => void;
  onBlur?: () => void;
  checked?: boolean;
  value?: boolean;
  name?: string;
  disabled?: boolean;
};

export const FieldSwitch = ({
  label: _label,
  onChange,
  value,
  checked,
  name,
  onBlur,
  disabled,
}: SwitchProps) => (
  <label>
    <input
      type="checkbox"
      name={name}
      checked={typeof checked !== "undefined" ? checked : Boolean(value)}
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  </label>
);

export default FieldSwitch;
