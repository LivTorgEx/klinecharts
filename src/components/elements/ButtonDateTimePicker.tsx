import { useState, type ReactNode } from "react";
import { Button, Input } from "@livtorgex/ui-kit";

type ButtonDateTimePickerProps = {
  onAccept?: (value: Date | null) => void;
  children?: ReactNode;
};

export function ButtonDateTimePicker({ onAccept, children }: ButtonDateTimePickerProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-2">
      <Input
        aria-label={typeof children === "string" ? children : "Date and time"}
        type="datetime-local"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="py-1.5"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAccept?.(value ? new Date(value) : null)}
      >
        {children ?? "Apply"}
      </Button>
    </div>
  );
}

export default ButtonDateTimePicker;
