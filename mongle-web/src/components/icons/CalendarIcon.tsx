import type { SVGProps } from 'react';

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 1.25C20.6904 1.25 21.25 1.80964 21.25 2.5V3.75H25C26.3807 3.75 27.5 4.86929 27.5 6.25V8.75C27.5 10.1307 26.3807 11.25 25 11.25H5C3.61929 11.25 2.5 10.1307 2.5 8.75V6.25C2.5 4.86929 3.61929 3.75 5 3.75H8.75V2.5C8.75 1.80964 9.30964 1.25 10 1.25C10.6904 1.25 11.25 1.80964 11.25 2.5V3.75H18.75V2.5C18.75 1.80964 19.3096 1.25 20 1.25Z"
        fill="currentColor"
      />
      <rect
        x="3.125"
        y="14.375"
        width="23.75"
        height="13.75"
        rx="1.875"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export default CalendarIcon;
