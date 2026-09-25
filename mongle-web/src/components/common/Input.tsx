import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
}

function Input({ id, label, errorMessage, className = '', disabled, ...props }: InputProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#F7F5FA]">
          {label}
        </label>
      )}

      <input
        id={id}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
        className={[
          'h-12 w-full rounded-[14px] border bg-[#120F18] px-4',
          'text-sm text-[#F7F5FA] placeholder:text-[#716A7B]',
          'outline-none transition-colors duration-200',
          'disabled:cursor-not-allowed disabled:text-[#4F4957]',
          hasError
            ? 'border-[#FF667C] focus:border-[#FF667C]'
            : 'border-[#27222F] focus:border-[#9B5CFF]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {errorMessage && (
        <p id={id ? `${id}-error` : undefined} className="text-xs text-[#FF667C]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default Input;
