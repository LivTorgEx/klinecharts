import { useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

type ButtonDateTimePickerProps = {
  onAccept?: (value: Date | null) => void;
  children?: React.ReactNode;
};

export const ButtonDateTimePicker = ({
  onAccept,
  children,
}: ButtonDateTimePickerProps) => {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <DateTimePicker
      value={value}
      onChange={setValue}
      onAccept={onAccept}
      label={typeof children === "string" ? children : undefined}
    />
  );
};

export default ButtonDateTimePicker;
