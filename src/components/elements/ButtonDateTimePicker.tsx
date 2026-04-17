import { useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        value={value}
        onChange={setValue}
        onAccept={onAccept}
        label={typeof children === "string" ? children : undefined}
      />
    </LocalizationProvider>
  );
};

export default ButtonDateTimePicker;
