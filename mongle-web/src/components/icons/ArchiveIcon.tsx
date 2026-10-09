import type { SVGProps } from 'react';

function ArchiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden="true" {...props}>
      <path
        d="M26.25 20.0001V10.0001C26.2496 9.56172 26.1338 9.13113 25.9144 8.75158C25.695 8.37202 25.3797 8.05683 25 7.83762L16.25 2.83762C15.87 2.6182 15.4388 2.50269 15 2.50269C14.5612 2.50269 14.13 2.6182 13.75 2.83762L5 7.83762C4.62033 8.05683 4.30498 8.37202 4.08558 8.75158C3.86618 9.13113 3.75045 9.56172 3.75 10.0001V20.0001C3.75045 20.4385 3.86618 20.8691 4.08558 21.2487C4.30498 21.6282 4.62033 21.9434 5 22.1626L13.75 27.1626C14.13 27.382 14.5612 27.4976 15 27.4976C15.4388 27.4976 15.87 27.382 16.25 27.1626L25 22.1626C25.3797 21.9434 25.695 21.6282 25.9144 21.2487C26.1338 20.8691 26.2496 20.4385 26.25 20.0001Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.0874 8.69995L14.9999 15.0125L25.9124 8.69995"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 27.6V15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 27.5V15L25 8.75V21.25L15 27.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5 8.75V21.25L15.625 26.875L16.25 15L5 8.75Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export default ArchiveIcon;
