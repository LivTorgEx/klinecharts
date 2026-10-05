import type { SVGProps } from "react";

export function FibonacciLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5.5h16M3 8.5h16M3 11.5h16M3 14.5h16M3 17.5h16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="5.5" r="1.7" /><circle cx="11" cy="17.5" r="1.7" />
    </svg>
  );
}
