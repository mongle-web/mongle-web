import imagePlusIcon from '@/assets/icons/dream-detail/image-plus.svg';
import DreamImage from '@/components/common/DreamImage';

interface DreamDetailImageProps {
  imageUrl?: string;
  title: string;
  onCreateImage: () => void;
}

function DreamDetailImage({ imageUrl, title, onCreateImage }: DreamDetailImageProps) {
  if (!imageUrl) {
    return (
      <button
        type="button"
        onClick={onCreateImage}
        className="flex h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl bg-linear-to-b from-n-800/80 to-n-800/15 pt-[14px]"
      >
        <img src={imagePlusIcon} alt="" className="size-12" />
        <span className="text-[14px] leading-[1.3] font-semibold text-b-400">이미지 생성하기</span>
      </button>
    );
  }

  return (
    <div className="relative h-[220px] w-full">
      <DreamImage src={imageUrl} alt={title} className="size-full rounded-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-b from-[rgba(30,29,39,0)] from-54% to-[rgba(30,29,39,0.6)]"
      />
    </div>
  );
}

export default DreamDetailImage;
