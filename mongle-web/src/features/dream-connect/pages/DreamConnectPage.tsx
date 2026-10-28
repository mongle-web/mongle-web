import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { BackHeader, PrimaryButton } from '@/components/common';
import ConnectDreamCard from '@/features/dream-connect/components/ConnectDreamCard';
import ConnectingModal from '@/features/dream-connect/components/ConnectingModal';
import ConnectSortToggle from '@/features/dream-connect/components/ConnectSortToggle';
import { useConnectableDreams } from '@/features/dream-connect/hooks/useConnectableDreams';
import { useConnectDreams } from '@/features/dream-connect/hooks/useConnectDreams';
import { MIN_CONNECT_DREAMS } from '@/features/dream-connect/types/dreamConnect';
import type { ConnectSort } from '@/features/dream-connect/types/dreamConnect';

// 꿈 연결하기 - 꿈 선택 (/connect)
// 피그마: iPhone 16 - 44(최신순) · 75(오래된순) · 48(선택) · 117(연결 중)
function DreamConnectPage() {
  const navigate = useNavigate();

  const [sort, setSort] = useState<ConnectSort>('LATEST');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // TODO: 불러오는 중 / 불러오기 실패 / 연결할 꿈이 없을 때 / 연결 실패 화면은 피그마 디자인 요청 중
  const { data: dreams = [] } = useConnectableDreams(sort);

  const { status, connect, cancel } = useConnectDreams((worldId) => {
    // TODO: 2단계(연결 결과 화면)에서 라우트 추가
    navigate(`/connect/${worldId}`, { replace: true });
  });

  const canConnect = selectedIds.length >= MIN_CONNECT_DREAMS;

  const toggleDream = (dreamId: number) => {
    setSelectedIds((ids) =>
      ids.includes(dreamId) ? ids.filter((id) => id !== dreamId) : [...ids, dreamId],
    );
  };

  const handleConnect = () => {
    if (!canConnect) return;
    connect(dreams.filter((dream) => selectedIds.includes(dream.dreamId)));
  };

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {/* 피그마: 위 20 · 좌우 20 · 아래 64, 정렬과 목록 사이 24, 카드 사이 12 */}
      <main className="flex flex-col items-end gap-6 px-5 pt-5 pb-16">
        <ConnectSortToggle sort={sort} onChange={setSort} />

        <ul className="flex w-full flex-col gap-3">
          {dreams.map((dream) => (
            <li key={dream.dreamId}>
              <ConnectDreamCard
                dream={dream}
                isSelected={selectedIds.includes(dream.dreamId)}
                onToggle={() => toggleDream(dream.dreamId)}
              />
            </li>
          ))}
        </ul>
      </main>

      {/* 피그마: 화면 아래 고정, 투명 → B-900(80%) 그라데이션, 버튼 아래 42 (8 + 홈 인디케이터 34) */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10">
        <div className="mx-auto w-full max-w-[480px] bg-linear-to-b from-[rgba(30,29,39,0)] to-b-900 to-80% px-5 pb-[42px]">
          <PrimaryButton
            // 피그마: 연결 중에도 버튼은 보라색 그대로 (모달이 위를 덮고, 중복 요청은 useConnectDreams에서 막음)
            disabled={!canConnect}
            onClick={handleConnect}
            className="pointer-events-auto"
          >
            선택한 꿈 연결하기
          </PrimaryButton>
        </div>
      </div>

      {status === 'connecting' && <ConnectingModal onClose={cancel} />}
    </div>
  );
}

export default DreamConnectPage;
