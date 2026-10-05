import type { SVGProps } from "react";

export function HorizontalRayLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <path d="M4 11h14M16 8l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
