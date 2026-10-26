import { useParams } from 'react-router-dom';

import editIcon from '@/assets/icons/dream-detail/edit.svg';
import { BackHeader } from '@/components/common';
import { DreamNotFoundError } from '@/features/dream-detail/api/dreamDetailApi';
import DreamDetailImage from '@/features/dream-detail/components/DreamDetailImage';
import DreamStoryCard from '@/features/dream-detail/components/DreamStoryCard';
import DreamTagSection from '@/features/dream-detail/components/DreamTagSection';
import { useDreamDetail } from '@/features/dream-detail/hooks/useDreamDetail';

// 꿈 상세 "나의 꿈 기록" (/dreams/:dreamId)
function DreamDetailPage() {
  const { dreamId } = useParams();
  const id = Number(dreamId);

  const { data: dream, isPending, isError, error, refetch } = useDreamDetail(id);

  const isNotFound = !Number.isInteger(id) || error instanceof DreamNotFoundError;

  const handleEdit = () => {
    // TODO: 2단계(꿈 수정 화면)에서 연결
  };

  const handleCreateImage = () => {
    // TODO: 기존 꿈으로 이미지 생성하는 흐름이 정해지면 연결 (꿈 기록 담당과 협의)
  };

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader
        title="나의 꿈 기록"
        rightSlot={
          dream ? (
            <button
              type="button"
              aria-label="꿈 기록 수정"
              onClick={handleEdit}
              className="size-7 cursor-pointer"
            >
              <img src={editIcon} alt="" className="size-7" />
            </button>
          ) : undefined
        }
      />

      <main className="flex flex-col gap-4 p-5">
        {isNotFound ? (
          <StatusMessage message="꿈 기록을 찾을 수 없어요." />
        ) : isError ? (
          <StatusMessage message="꿈 기록을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : isPending ? (
          <DreamDetailSkeleton />
        ) : (
          <>
            <DreamDetailImage
              imageUrl={dream.imageUrl}
              title={dream.title}
              onCreateImage={handleCreateImage}
            />
            <DreamStoryCard dream={dream} />
            <DreamTagSection title="감정" tags={dream.emotions} />
            <DreamTagSection title="키워드" tags={dream.keywords} />
          </>
        )}
      </main>
    </div>
  );
}

interface StatusMessageProps {
  message: string;
  onRetry?: () => void;
}

// 찾을 수 없음 / 불러오기 실패 안내
function StatusMessage({ message, onRetry }: StatusMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-n-900 px-5 py-10 text-center">
      <p className="text-[14px] text-b-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-9 cursor-pointer rounded-full bg-p-100 px-4 text-[12px] font-medium text-b-800"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

// 불러오는 동안 화면 모양만 미리 보여주는 회색 상자
function DreamDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="꿈 기록 불러오는 중" className="flex flex-col gap-4">
      <div className="h-[220px] animate-pulse rounded-3xl bg-n-800" />
      <div className="h-[211px] animate-pulse rounded-3xl bg-n-800" />
      <div className="h-[104px] animate-pulse rounded-3xl bg-n-800" />
    </div>
  );
}

export default DreamDetailPage;
