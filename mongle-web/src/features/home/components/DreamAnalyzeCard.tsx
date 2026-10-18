import { useNavigate } from 'react-router-dom';

const DREAM_ANALYSIS_PATH = '/dreams/analysis';

interface DreamAnalyzeCardProps {
  // 이번 달 가장 많이 나온 감정 키워드 (예: '불안')
  keyword: string;
}

// 꿈 분석 기록 카드
function DreamAnalyzeCard({ keyword }: DreamAnalyzeCardProps) {
  const navigate = useNavigate();

  const handleArrowClick = () => {
    navigate(DREAM_ANALYSIS_PATH);
  };

  return (
    <div className="flex flex-col items-start gap-2 self-stretch rounded-[24px] bg-n-900 px-5 py-4">
      <div className="flex items-center text-[16px] leading-[1.5] font-medium text-b-200">
        꿈 분석 기록
        <button
          type="button"
          onClick={handleArrowClick}
          aria-label="꿈 분석 기록 보기"
          className="cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
            <path
              d="M9.1665 15L14.1665 10L9.1665 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 감정 키워드 말풍선 */}
      <div className="relative flex w-full items-center gap-2.5 rounded-full bg-n-800 px-3 py-1.5">
        <p className="relative z-10 text-[14px] leading-[1.5] font-medium text-b-400">
          이번달에는 <span className="font-semibold text-p-300">‘{keyword}’</span> 감정 키워드가
          많이 나왔어요.
        </p>

        {/* 말풍선 꼬리 */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="absolute -bottom-1 left-0 size-5 text-n-800"
        >
          <path
            d="M4.9707 6C4.89223 10.3966 4.59607 13.1008 3.47363 15.3037C2.61597 16.9868 1.43038 18.4671 0 19.668V20H6C13.732 20 20 13.732 20 6H4.9707Z"
            fill="currentColor"
          />
          <rect width="14" height="6" transform="matrix(-1 0 0 1 19 0)" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

export default DreamAnalyzeCard;
