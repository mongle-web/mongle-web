import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { BackHeader } from '@/components/common';
import { formatDreamDate } from '@/features/calendar/utils/calendar';
import {
  DreamNotFoundError,
  getDreamMutationStatus,
} from '@/features/dream-detail/api/dreamDetailApi';
import DreamDetailImage from '@/features/dream-detail/components/DreamDetailImage';
import {
  DreamDetailSkeleton,
  StatusMessage,
} from '@/features/dream-detail/components/DreamDetailStatus';
import DreamEditField from '@/features/dream-detail/components/DreamEditField';
import DreamTagSection from '@/features/dream-detail/components/DreamTagSection';
import { useDreamDetail } from '@/features/dream-detail/hooks/useDreamDetail';
import { useUpdateDreamDetail } from '@/features/dream-detail/hooks/useUpdateDreamDetail';
import {
  DREAM_CONTENT_MAX_LENGTH,
  DREAM_TITLE_MAX_LENGTH,
  UNTITLED_DREAM_TITLE,
} from '@/features/dream-detail/types/dreamDetail';
import type { DreamDetail } from '@/features/dream-detail/types/dreamDetail';

const PAGE_TITLE = '나의 꿈 기록';

// 꿈 수정 (/dreams/:dreamId/edit)
// 제목 · 내용만 수정 가능, 감정 · 키워드는 보기만
function DreamEditPage() {
  const { dreamId } = useParams();
  const id = Number(dreamId);

  const { data: dream, isPending, isError, error, refetch } = useDreamDetail(id);

  const isNotFound = !Number.isInteger(id) || error instanceof DreamNotFoundError;

  // 데이터를 받은 뒤에만 입력 폼을 만든다 (입력값 초기값을 꿈 데이터로 채우기 위해)
  if (dream) return <DreamEditForm key={dream.id} dream={dream} />;

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title={PAGE_TITLE} />

      <main className="flex flex-col gap-4 p-5">
        {isNotFound ? (
          <StatusMessage message="꿈 기록을 찾을 수 없어요." />
        ) : isError ? (
          <StatusMessage message="꿈 기록을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : (
          isPending && <DreamDetailSkeleton />
        )}
      </main>
    </div>
  );
}

interface DreamEditFormProps {
  dream: DreamDetail;
}

function DreamEditForm({ dream }: DreamEditFormProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateDreamDetail(dream);

  // 들어오면 수정 가능한지 미리 확인 (이야기 · 이미지 · 세계관 작업 중이면 저장 시 409로 막히므로 먼저 안내)
  // 조회 실패 시에는 저장을 허용 (실제 저장 때 서버가 다시 검사)
  const mutationStatus = useQuery({
    queryKey: ['dreams', 'mutation-status', dream.id],
    queryFn: () => getDreamMutationStatus(dream.id),
    staleTime: 0,
  });
  const isLocked = mutationStatus.data?.mutable === false;

  const [title, setTitle] = useState(dream.title);
  const [content, setContent] = useState(dream.content);

  // 비어 있으면(공백만 있어도) 오류 표시 + 저장 불가
  const isTitleError = title.trim().length === 0;
  const isContentError = content.trim().length === 0;

  const handleComplete = () => {
    if (isTitleError || isContentError || updateMutation.isPending || isLocked) return;

    const nextTitle = title.trim();
    const nextContent = content.trim();

    // 바뀐 게 없으면 저장 요청 없이 상세로 돌아감
    if (nextTitle === dream.title && nextContent === dream.content) {
      navigate(-1);
      return;
    }

    updateMutation.mutate(
      { title: nextTitle, content: nextContent },
      { onSuccess: () => navigate(-1) },
    );
  };

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader
        title={PAGE_TITLE}
        rightSlot={
          // 피그마: 14 SemiBold, P-300, 오른쪽 정렬, 너비 28
          // global.css의 button { font: inherit } 보다 우선하도록 글자 스타일에 ! 사용
          <button
            type="button"
            onClick={handleComplete}
            disabled={updateMutation.isPending || isLocked}
            className="min-w-7 cursor-pointer text-right text-[14px]! leading-[1.5]! font-semibold! whitespace-nowrap text-p-300 disabled:cursor-default disabled:opacity-50"
          >
            완료
          </button>
        }
      />

      {/* 피그마: 본문 영역 여백 20px, 카드 사이 16px */}
      <main className="flex flex-col gap-4 p-5">
        {/* 수정 화면에서는 이미지 생성 버튼 없이, 이미지가 있을 때만 보여줌 */}
        {dream.imageUrl && (
          <DreamDetailImage
            imageUrl={dream.imageUrl}
            title={dream.title || UNTITLED_DREAM_TITLE}
            onCreateImage={() => {}}
          />
        )}

        <section className="flex w-full flex-col gap-4 rounded-3xl bg-linear-to-b from-n-800/80 to-n-800/15 p-5">
          <p className="text-[12px] leading-[1.5] text-b-400">{formatDreamDate(dream.date)}</p>

          <DreamEditField
            label="꿈 제목"
            variant="title"
            value={title}
            maxLength={DREAM_TITLE_MAX_LENGTH}
            isError={isTitleError}
            onChange={setTitle}
          />

          <DreamEditField
            label="꿈 내용"
            variant="content"
            value={content}
            maxLength={DREAM_CONTENT_MAX_LENGTH}
            isError={isContentError}
            onChange={setContent}
          />
        </section>

        <DreamTagSection title="감정" tags={dream.emotions} />
        <DreamTagSection title="키워드" tags={dream.keywords} />

        {isLocked && (
          <p role="alert" className="text-center text-[12px] leading-[1.5] text-[#ff6f6f]">
            이야기와 이미지를 만드는 중이라 지금은 수정할 수 없어요.
          </p>
        )}

        {!isLocked && updateMutation.isError && (
          <p role="alert" className="text-center text-[12px] leading-[1.5] text-[#ff6f6f]">
            저장하지 못했어요. 다시 시도해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}

export default DreamEditPage;
