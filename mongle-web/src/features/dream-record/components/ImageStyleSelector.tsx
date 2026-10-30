import cubismImage from '@/assets/images/dream-record/styles/cubism.png';
import expressionismImage from '@/assets/images/dream-record/styles/expressionism.png';
import illustrationImage from '@/assets/images/dream-record/styles/illustration.png';
import surrealismImage from '@/assets/images/dream-record/styles/surrealism.png';

import {
  resolveImageStyles,
  type ImageStyleCardId,
} from '@/features/dream-record/utils/imageStyles';

const STYLE_IMAGES: Record<ImageStyleCardId, string> = {
  surrealism: surrealismImage,
  cubism: cubismImage,
  expressionism: expressionismImage,
  illustration: illustrationImage,
};

interface ImageStyleSelectorProps {
  serverStyles: readonly string[];
  selected: string;
  disabled?: boolean;
  onSelect: (serverValue: string) => void;
}

function ImageStyleSelector({
  serverStyles,
  selected,
  disabled = false,
  onSelect,
}: ImageStyleSelectorProps) {
  const styles = resolveImageStyles(serverStyles);

  return (
    <div role="radiogroup" aria-label="화풍 선택" className="mt-[15px] grid grid-cols-2 gap-4">
      {styles.map((style) => {
        const isSelected = style.serverValue !== null && selected === style.serverValue;

        const unavailable = style.serverValue === null;

        return (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={disabled || unavailable}
            disabled={disabled}
            onClick={() => {
              if (!disabled && style.serverValue) {
                onSelect(style.serverValue);
              }
            }}
            className={[
              // 기본 카드
              'mongle-dream-style-card group relative h-[235px] min-w-0 overflow-hidden rounded-[24px] bg-n-900',

              // 기본 애니메이션
              'transform-gpu transition-[transform,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none',

              // 키보드 접근성
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-p-300',

              // 선택 상태
              isSelected
                ? 'border border-p-300 shadow-[0_0_24px_rgba(188,179,255,0.5)]'
                : 'border border-transparent',

              // 서버 미지원 상태
              unavailable ? 'cursor-not-allowed' : 'cursor-pointer',

              // 전체 비활성 상태
              disabled ? 'opacity-60' : '',
            ].join(' ')}
          >
            {/* 화풍 이미지 */}
            <img
              src={STYLE_IMAGES[style.id]}
              alt=""
              aria-hidden="true"
              className={[
                'mongle-dream-style-image',
                'pointer-events-none absolute top-[-9.57%] left-0',
                'h-[112.33%] w-full max-w-none object-cover',
                'transition-[filter,transform] duration-200 ease-out motion-reduce:transition-none',

                // 기본 이미지 어둡게
                !isSelected ? 'brightness-[0.68] saturate-[0.86]' : 'brightness-100',
              ].join(' ')}
            />

            {/* 이미지 오버레이 */}
            <span
              aria-hidden="true"
              className={[
                'pointer-events-none absolute inset-0 rounded-[24px]',
                'transition-opacity duration-200 motion-reduce:transition-none',

                isSelected
                  ? 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_58.667%,rgba(0,0,0,0.65)_82.574%)]'
                  : 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.4),rgba(0,0,0,0.8))]',

                // 호버 시 오버레이 투명도 감소
                'group-hover:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.55))]',
              ].join(' ')}
            />

            {/* 화풍 이름 */}
            <span
              className={[
                'pointer-events-none absolute bottom-[15px] left-1/2',
                'flex h-[34px] w-[76px] -translate-x-1/2',
                'items-center justify-center rounded-full',
                'bg-b-900/10 px-3 py-2',
                'text-center text-[12px] leading-[1.5]',
                'font-normal whitespace-nowrap text-b-200',
                'transition-colors duration-200 motion-reduce:transition-none',
              ].join(' ')}
            >
              {style.label}
            </span>

            {/* 선택 상태 표시 */}
            {isSelected && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-p-500 text-white shadow-lg"
              >
                ✓
              </span>
            )}

            {/* 서버 미지원 안내 */}
            {unavailable && <span className="sr-only">현재 서버에서 지원하지 않는 화풍</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ImageStyleSelector;
