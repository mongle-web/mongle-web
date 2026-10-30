import { useNavigate, useParams } from 'react-router-dom';

import editIcon from '@/assets/icons/dream-detail/edit.svg';
import { BackHeader } from '@/components/common';
import { DreamNotFoundError } from '@/features/dream-detail/api/dreamDetailApi';
import DreamDetailImage from '@/features/dream-detail/components/DreamDetailImage';
import {
  DreamDetailSkeleton,
  StatusMessage,
} from '@/features/dream-detail/components/DreamDetailStatus';
import DreamStoryCard from '@/features/dream-detail/components/DreamStoryCard';
import DreamTagSection from '@/features/dream-detail/components/DreamTagSection';
import { useDreamDetail } from '@/features/dream-detail/hooks/useDreamDetail';
import { UNTITLED_DREAM_TITLE } from '@/features/dream-detail/types/dreamDetail';

// 꿈 상세 "나의 꿈 기록" (/dreams/:dreamId)
function DreamDetailPage() {
  const navigate = useNavigate();
  const { dreamId } = useParams();
  const id = Number(dreamId);

  const { data: dream, isPending, isError, error, refetch } = useDreamDetail(id);

  const isNotFound = !Number.isInteger(id) || error instanceof DreamNotFoundError;

  const handleEdit = () => {
    navigate(`/dreams/${id}/edit`);
  };

  // 이미지가 없는 꿈 → 꿈 기록의 화풍 선택 → 생성 흐름 재사용 (꿈 기록 담당과 협의)
  // date: 꿈 기록 화면은 주소의 날짜와 꿈 날짜가 같아야 해서 같이 넘김
  const handleCreateImage = () => {
    if (!dream) return;
    navigate(`/dreams/new?dreamId=${dream.id}&date=${dream.date}&entry=image`);
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

      {/* 피그마: 본문 영역 여백 20px, 카드 사이 16px */}
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
              title={dream.title || UNTITLED_DREAM_TITLE}
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

export default DreamDetailPage;
