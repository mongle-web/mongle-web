export interface EmotionStat {
  emotion: string;
  count: number;
}

interface EmotionSectionProps {
  emotions: EmotionStat[];
}

const MAX_BAR_WIDTH = 200;
const MIN_BAR_WIDTH = 32;
// 디자인상 상위 3개만 표시
const MAX_VISIBLE_COUNT = 3;

interface EmotionBarProps extends EmotionStat {
  maxCount: number;
}

function EmotionBar({ emotion, count, maxCount }: EmotionBarProps) {
  const barWidth = Math.max((count / maxCount) * MAX_BAR_WIDTH, MIN_BAR_WIDTH);

  return (
    <li className="flex w-full items-center">
      <span className="w-[52px] shrink-0 text-[14px] leading-[1.5] font-semibold text-b-400">
        {emotion}
      </span>

      <div className="min-w-0 flex-1">
        <div
          className="h-8 max-w-full rounded-[8px_16px_16px_8px] bg-n-800"
          style={{ width: barWidth }}
        />
      </div>

      <span className="w-10 shrink-0 text-right text-[14px] leading-[1.5] font-medium text-b-600">
        {count}건
      </span>
    </li>
  );
}

// 자주 나타난 감정
function EmotionSection({ emotions }: EmotionSectionProps) {
  // 많은 순 정렬 (sort는 동점일 때 원래 순서 유지), 상위 3개만
  const visibleEmotions = [...emotions]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_VISIBLE_COUNT);
  const maxCount = visibleEmotions[0]?.count ?? 0;

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="text-[16px] leading-[1.5] font-medium text-b-200">자주 나타난 감정</h2>

      {maxCount > 0 ? (
        <ul className="flex flex-col items-start gap-1 self-stretch px-4">
          {visibleEmotions.map((item) => (
            <EmotionBar key={item.emotion} {...item} maxCount={maxCount} />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-[14px] leading-[1.5] font-semibold text-b-400">
          아직 기록된 감정이 없어요
        </p>
      )}
    </section>
  );
}

export default EmotionSection;
