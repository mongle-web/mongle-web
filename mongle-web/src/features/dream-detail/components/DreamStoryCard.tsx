import { useState } from 'react';

import { formatDreamDate } from '@/features/calendar/utils/calendar';
import AiToggle from '@/features/dream-detail/components/AiToggle';
import type { DreamDetail } from '@/features/dream-detail/types/dreamDetail';

interface DreamStoryCardProps {
  dream: DreamDetail;
}

// 제목 · 날짜 · 꿈 내용 카드
// - AI 이야기가 있으면 "AI 작성 부분 표시" 토글 노출
//   켜짐: AI가 다듬은 이야기 + AI가 쓴 부분 강조 / 꺼짐: 사용자가 쓴 원래 내용
// - AI 이야기가 없으면 토글 없이 원래 내용만
function DreamStoryCard({ dream }: DreamStoryCardProps) {
  const hasAiStory = Boolean(dream.aiStory?.length);
  const [isAiVisible, setIsAiVisible] = useState(true);

  const isShowingAiStory = hasAiStory && isAiVisible;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-linear-to-b from-n-800/80 to-n-800/15 p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-[18px] leading-[1.4] font-semibold break-keep text-b-200">
            {dream.title}
          </h2>
          <p className="text-[12px] leading-[1.5] text-b-400">{formatDreamDate(dream.date)}</p>
        </div>

        {hasAiStory && <AiToggle isOn={isAiVisible} onChange={setIsAiVisible} />}
      </div>

      {isShowingAiStory ? (
        // 피그마: 강조 상자 높이 22px(글자 18 + 위아래 2), 줄 사이 8px → 줄 간격 30px
        // 줄 간격 30px 중 첫 줄 위 · 마지막 줄 아래에 남는 4px씩은 -my-1로 상쇄
        // 피그마처럼 단어 단위로 줄바꿈 (break-keep)
        <p className="-my-1 text-[12px] leading-[30px] break-keep text-b-400">
          {dream.aiStory?.map((segment, index) =>
            segment.isAi ? (
              <span
                key={index}
                className="rounded-[4px] bg-[#5e5b74] p-0.5 text-b-200 [box-decoration-break:clone]"
              >
                {segment.text}
              </span>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </p>
      ) : (
        <p className="text-[12px] leading-[1.5] whitespace-pre-line text-b-200">{dream.content}</p>
      )}
    </section>
  );
}

export default DreamStoryCard;
