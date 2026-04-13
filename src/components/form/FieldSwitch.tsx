import React from "react";

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;
export const FieldSwitch = (props: SwitchProps) => (
  <label>
    <input type="checkbox" {...props} />
  </label>
);
export default FieldSwitch;
