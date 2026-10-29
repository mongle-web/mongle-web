import happyImage from '@/assets/images/dream-record/emotions/행복.png';
import calmImage from '@/assets/images/dream-record/emotions/편안함.png';
import excitedImage from '@/assets/images/dream-record/emotions/설렘.png';
import sadImage from '@/assets/images/dream-record/emotions/슬픔.png';
import anxiousImage from '@/assets/images/dream-record/emotions/불안.png';
import angryImage from '@/assets/images/dream-record/emotions/화남.png';
import surprisedImage from '@/assets/images/dream-record/emotions/당황.png';

import { EMOTIONS, MAX_EMOTIONS, type Emotion } from '@/features/dream-record/utils/dreamDraft';

const EMOTION_IMAGES: Record<Emotion, string> = {
  행복: happyImage,
  편안함: calmImage,
  설렘: excitedImage,
  슬픔: sadImage,
  불안: anxiousImage,
  화남: angryImage,
  당황: surprisedImage,
};

interface EmotionSelectorProps {
  selected: Emotion[];
  disabled?: boolean;
  onToggle: (emotion: Emotion) => void;
}

function EmotionSelector({ selected, onToggle, disabled = false }: EmotionSelectorProps) {
  return (
    <section
      aria-label={`꿈 감정 선택, 최대 ${MAX_EMOTIONS}개`}
      className="mt-10 flex flex-col gap-3"
    >
      {EMOTIONS.map((emotion) => {
        const isSelected = selected.includes(emotion);

        return (
          <button
            key={emotion}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onToggle(emotion)}
            className={[
              'relative flex h-14 w-full shrink-0 items-center overflow-hidden rounded-[16px] pl-[22px] pr-[112px]',
              'text-left text-[18px] font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-p-300',
              isSelected
                ? 'bg-n-800 text-b-200 shadow-[0_0_16px_rgba(206,204,226,0.15)]'
                : 'bg-n-900 text-b-400',
            ].join(' ')}
          >
            {emotion}

            {isSelected && (
              <img
                src={EMOTION_IMAGES[emotion]}
                alt=""
                aria-hidden="true"
                width={101}
                height={56}
                className="pointer-events-none absolute top-0 right-0 h-14 w-[101px] max-w-none object-contain"
              />
            )}
          </button>
        );
      })}
    </section>
  );
}

export default EmotionSelector;
