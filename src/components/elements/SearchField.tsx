import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const SearchField = (props: InputProps) => <input {...props} />;
export default SearchField;
