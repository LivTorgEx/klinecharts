type SearchFieldProps = {
    fullWidth?: boolean;
    defaultValue?: string;
    onChange?: (value: string) => void;
    delay?: number;
    placeholder?: string;
};
export declare const SearchField: ({ onChange, fullWidth: _fullWidth, delay: _delay, ...restProps }: SearchFieldProps) => import("react/jsx-runtime").JSX.Element;
export default SearchField;
