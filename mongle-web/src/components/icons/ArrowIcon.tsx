import type { SVGProps } from 'react';

interface ArrowIconProps extends SVGProps<SVGSVGElement> {
  // 기본(0)은 오른쪽 방향, 180이면 왼쪽 방향
  rotate?: number;
}

// 삼각형 방향키 (색은 currentColor라 text-* 클래스로 지정)
function ArrowIcon({ rotate = 0, style, ...props }: ArrowIconProps) {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
      {...props}
    >
      <path
        d="M9.50385 4.60226C10.6913 5.3939 10.6913 7.13881 9.50385 7.93046L3.1094 12.1934C1.78029 13.0795 3.47819e-07 12.1267 4.17643e-07 10.5293L7.90323e-07 2.00339C8.60148e-07 0.406001 1.78029 -0.546782 3.1094 0.339291L9.50385 4.60226Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ArrowIcon;
