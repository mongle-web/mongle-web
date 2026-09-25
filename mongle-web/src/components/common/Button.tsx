import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-[#9B5CFF] text-white hover:bg-[#AB78FF] active:bg-[#8445E8] disabled:bg-[#4F4957]',
  secondary:
    'border border-[#393142] bg-[#1A1621] text-[#F7F5FA] hover:bg-[#211B29] active:bg-[#17131D] disabled:text-[#716A7B]',
  ghost:
    'bg-transparent text-[#AAA3B5] hover:bg-[#1A1621] hover:text-[#F7F5FA] active:bg-[#120F18] disabled:text-[#4F4957]',
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
};

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-[14px] font-semibold',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B5CFF]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070D]',
        'disabled:cursor-not-allowed',
        variantClassNames[variant],
        sizeClassNames[size],
        isFullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? '잠시만 기다려주세요' : children}
    </button>
  );
}

export default Button;
