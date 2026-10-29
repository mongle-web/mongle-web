import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { BackHeader, PrimaryButton } from '@/components/common';
import ConnectDreamCard from '@/features/dream-connect/components/ConnectDreamCard';
import ConnectFailModal from '@/features/dream-connect/components/ConnectFailModal';
import ConnectingModal from '@/features/dream-connect/components/ConnectingModal';
import ConnectSortToggle from '@/features/dream-connect/components/ConnectSortToggle';
import ConnectStateView from '@/features/dream-connect/components/ConnectStateView';
import { useConnectableDreams } from '@/features/dream-connect/hooks/useConnectableDreams';
import { useConnectDreams } from '@/features/dream-connect/hooks/useConnectDreams';
import { MIN_CONNECT_DREAMS } from '@/features/dream-connect/types/dreamConnect';
import type { ConnectAddState, ConnectSort } from '@/features/dream-connect/types/dreamConnect';

// 꿈 연결하기 - 꿈 선택 (/connect)
// 결과 화면 "+"로 들어오면 연결된 꿈에 더하거나 빼서 다시 연결
// 피그마: iPhone 16 - 44(최신순) · 75(오래된순) · 48(선택) · 117(연결 중)
//   127(불러오는 중) · 129(불러오기 실패) · 126(연결할 꿈 없음) · 133(연결 실패)
function DreamConnectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 결과 화면 "+"로 들어오면 이미 연결된 꿈이 체크된 채로 시작
  const addState = (useLocation().state as ConnectAddState | null) ?? undefined;

  const [sort, setSort] = useState<ConnectSort>('LATEST');
  const [selectedIds, setSelectedIds] = useState<number[]>(addState?.connectedDreamIds ?? []);

  const { data: dreams = [], isPending, isError } = useConnectableDreams(sort);

  const { status, connect, cancel, resetError } = useConnectDreams((worldId) => {
    if (addState) {
      // 꿈 추가였으면 원래 결과 화면으로 돌아감 (결과는 다시 불러옴)
      queryClient.invalidateQueries({ queryKey: ['dreams', 'connect', 'world', worldId] });
      navigate(-1);
      return;
    }

    navigate(`/connect/${worldId}`, { replace: true });
  });

  const canConnect = selectedIds.length >= MIN_CONNECT_DREAMS;

  // 불러오는 중 · 불러오기 실패 · 연결할 꿈이 2개 미만이면 목록 · 버튼 대신 안내 화면
  const pageState = (() => {
    if (isPending) return 'loading';
    if (isError) return 'error';
    if (dreams.length < MIN_CONNECT_DREAMS) return 'empty';
    return null;
  })();

  const toggleDream = (dreamId: number) => {
    setSelectedIds((ids) =>
      ids.includes(dreamId) ? ids.filter((id) => id !== dreamId) : [...ids, dreamId],
    );
  };

  const handleConnect = () => {
    if (!canConnect) return;
    connect(
      dreams.filter((dream) => selectedIds.includes(dream.dreamId)),
      addState,
    );
  };

  if (pageState) {
    return (
      // 빛 번짐이 화면 밖으로 나가도 가로 스크롤이 생기지 않게 overflow-x-clip
      <div className="relative min-h-dvh overflow-x-clip bg-b-900">
        <BackHeader title="꿈 연결하기" />
        <ConnectStateView state={pageState} />
      </div>
    );
  }

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
      {status === 'error' && <ConnectFailModal type="connect" onClose={resetError} />}
    </div>
  );
}

export default DreamConnectPage;
