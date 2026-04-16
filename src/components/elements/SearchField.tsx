type SearchFieldProps = {
  fullWidth?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
  delay?: number;
  placeholder?: string;
};

export const SearchField = ({ onChange, fullWidth: _fullWidth, delay: _delay, ...restProps }: SearchFieldProps) => (
  <input
    {...restProps}
    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
  />
);

export default SearchField;
