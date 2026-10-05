import type { SVGProps } from "react";

export function HorizontalStraightLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <path d="M3 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
