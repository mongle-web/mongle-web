import type { ReactNode } from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  onClick?: () => void;
  imageClassName?: string;
  children?: ReactNode;
}

function QuickActionCard({
  title,
  description,
  image,
  imageAlt = '',
  onClick,
  imageClassName = '',
  children,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[60px] w-full items-center overflow-hidden rounded-[20px] bg-[#24212E] px-4 py-3 text-left transition active:scale-[0.99]"
    >
      <div className="relative z-10 min-w-0 flex-1 pr-20">
        <p className="text-[13px] font-semibold text-[#F7F5FA]">{title}</p>

        <p className="mt-1 text-[10px] leading-[1.4] text-[#716A7B]">{description}</p>

        {children}
      </div>

      <img
        src={image}
        alt={imageAlt}
        className={`absolute right-3 bottom-0 object-contain ${imageClassName}`}
      />
    </button>
  );
}

export default QuickActionCard;
