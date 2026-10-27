import type { SVGProps } from 'react';

function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 90 90" fill="none" aria-hidden="true" {...props}>
      <circle cx="45" cy="45" r="45" fill="#413E58" />
      <path
        d="M45.563 51.75C60.8758 51.7502 73.6338 62.6774 76.4712 77.1592C68.3567 85.1012 57.2517 89.9999 45.0005 90C33.2253 90 22.5079 85.4753 14.4878 78.0723C16.9575 63.1389 29.9296 51.75 45.563 51.75ZM45.563 15.75C54.2612 15.7503 61.313 22.8017 61.313 31.5C61.313 40.1983 54.2612 47.2497 45.563 47.25C36.8645 47.25 29.813 40.1985 29.813 31.5C29.813 22.8015 36.8645 15.75 45.563 15.75Z"
        fill="#292834"
      />
    </svg>
  );
}

export default ProfileIcon;
