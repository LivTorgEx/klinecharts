type ButtonDateTimePickerProps = {
  onAccept?: (value: Date | null) => void;
  children?: React.ReactNode;
};

export const ButtonDateTimePicker = ({ onAccept, children }: ButtonDateTimePickerProps) => (
  <input
    type="datetime-local"
    title={typeof children === "string" ? children : undefined}
    onChange={(e) => onAccept?.(e.target.value ? new Date(e.target.value) : null)}
  />
);

export default ButtonDateTimePicker;
