import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

export const ButtonDateTimePicker = (props: ButtonProps) => (
  <button {...props}>{props.children ?? "Pick"}</button>
);

export default ButtonDateTimePicker;
