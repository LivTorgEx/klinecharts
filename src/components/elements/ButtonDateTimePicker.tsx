import React from 'react';
export const ButtonDateTimePicker = (props: any) => (
  <button {...props}>{props.children ?? 'Pick'}</button>
);
export default ButtonDateTimePicker;
