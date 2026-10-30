import { useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { BackHeader } from '@/components/common';
import CalendarDialog from '@/features/calendar/components/CalendarDialog';
import ArchiveDreamCard from '@/features/dream-archive/components/ArchiveDreamCard';
import ArchiveEmptyState from '@/features/dream-archive/components/ArchiveEmptyState';
import ArchiveSearchBar from '@/features/dream-archive/components/ArchiveSearchBar';
import ArchiveTabs from '@/features/dream-archive/components/ArchiveTabs';
import type { ArchiveEmptyType } from '@/features/dream-archive/components/ArchiveEmptyState';
import {
  useArchiveDreams,
  useConnectedDreams,
} from '@/features/dream-archive/hooks/useArchiveDreams';
import { useDeleteConnectedDream } from '@/features/dream-archive/hooks/useDeleteConnectedDream';
import { useDeleteRecordedDream } from '@/features/dream-archive/hooks/useDeleteRecordedDream';
import type {
  ArchiveDream,
  ArchiveTab,
  ConnectedDream,
  RecordedDream,
} from '@/features/dream-archive/types/dreamArchive';
import ConnectStateView from '@/features/dream-connect/components/ConnectStateView';

// 제목 · 키워드에 검색어가 들어 있는 꿈만 남긴다 (대소문자 · 앞뒤 공백 무시)
const filterBySearch = <T extends ArchiveDream>(dreams: T[], search: string) => {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return dreams;

  return dreams.filter(
    (dream) =>
      dream.title.toLowerCase().includes(keyword) ||
      dream.keywords.some((item) => item.toLowerCase().includes(keyword)),
  );
};

// 지난 꿈 보관함 (/archive)
// 피그마: 헤더 제목은 최신 디자인(iPhone 16 - 119 · 124 · 125 · 130 · 131)대로 "지난 꿈 보관함"
// 피그마: 불러오는 중 · 불러오기 실패는 꿈 연결하기와 같은 화면에 제목만 "지난 꿈 보관함" (iPhone 16 - 130 · 131)
function DreamArchivePage() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<ArchiveTab>('recorded');
  const [search, setSearch] = useState('');
  const [dreamToDelete, setDreamToDelete] = useState<RecordedDream | ConnectedDream | null>(null);

  const recordedQuery = useArchiveDreams();
  const connectedQuery = useConnectedDreams();
  const { data: recordedDreams = [] } = recordedQuery;
  const { data: connectedDreams = [] } = connectedQuery;

  // 지금 보고 있는 탭의 목록 상태
  const currentQuery = selectedTab === 'recorded' ? recordedQuery : connectedQuery;
  const currentDreams: ArchiveDream[] =
    selectedTab === 'recorded' ? recordedDreams : connectedDreams;

  // 탭에 꿈이 하나도 없으면 검색창 · 목록 대신 안내 화면 (피그마: 기록한 꿈 iPhone 16 - 119 · 연결된 꿈 124)
  // 검색 결과만 없으면 검색창은 두고 안내 화면 (피그마: iPhone 16 - 125, 두 탭 공통)
  const emptyType = ((): ArchiveEmptyType | null => {
    if (currentDreams.length === 0) return selectedTab;
    if (filterBySearch(currentDreams, search).length === 0) return 'search';
    return null;
  })();
  const isTabEmpty = emptyType === 'recorded' || emptyType === 'connected';

  const deleteRecordedMutation = useDeleteRecordedDream();
  const deleteConnectedMutation = useDeleteConnectedDream();
  const deleteMutation =
    selectedTab === 'recorded' ? deleteRecordedMutation : deleteConnectedMutation;

  const closeDeleteDialog = () => {
    deleteMutation.reset(); // 이전 실패 메시지 지우기
    setDreamToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!dreamToDelete) return;

    const onSuccess = () => setDreamToDelete(null);

    // 기록한 꿈은 revision을 같이 넘겨서 삭제, 연결된 꿈은 세계관 id로 삭제
    if ('revision' in dreamToDelete) {
      deleteRecordedMutation.mutate(dreamToDelete, { onSuccess });
    } else {
      deleteConnectedMutation.mutate(dreamToDelete.id, { onSuccess });
    }
  };

  // 불러오는 중 · 불러오기 실패면 탭 없이 안내 화면 (실패는 화면을 나갔다 들어오면 다시 불러옴)
  if (currentQuery.isPending || currentQuery.isError) {
    return (
      <div className="relative min-h-dvh overflow-x-clip bg-b-900">
        <BackHeader title="지난 꿈 보관함" />
        <ConnectStateView state={currentQuery.isError ? 'error' : 'loading'} />
      </div>
    );
  }

  return (
    <>
      {/* 빈 화면의 빛 번짐이 화면 밖으로 나가도 가로 스크롤이 생기지 않게 overflow-x-clip */}
      <div className="relative min-h-dvh overflow-x-clip bg-b-900">
        <BackHeader title="지난 꿈 보관함" />

        {/* 피그마: 위 20 · 좌우 20 · 아래 64, 탭과 목록 사이 28 */}
        <main className="flex flex-col gap-7 px-5 pt-5 pb-16">
          <ArchiveTabs selectedTab={selectedTab} onChange={setSelectedTab} />

          {/* 피그마: 검색창과 카드 목록 사이 12, 카드 사이 8 */}
          {!isTabEmpty && (
            <div className="flex flex-col gap-3">
              <ArchiveSearchBar value={search} onChange={setSearch} />

              <ul className="flex flex-col gap-2">
                {selectedTab === 'recorded'
                  ? filterBySearch(recordedDreams, search).map((dream) => (
                      <li key={dream.id}>
                        <ArchiveDreamCard
                          dream={dream}
                          onClick={() => navigate(`/dreams/${dream.id}`)}
                          onDelete={() => setDreamToDelete(dream)}
                        />
                      </li>
                    ))
                  : filterBySearch(connectedDreams, search).map((dream) => (
                      <li key={dream.id}>
                        <ArchiveDreamCard
                          dream={dream}
                          connectedDreams={{
                            firstTitle: dream.firstDreamTitle,
                            count: dream.connectedDreamCount,
                          }}
                          onClick={() => navigate(`/connect/${dream.id}`)}
                          onDelete={() => setDreamToDelete(dream)}
                        />
                      </li>
                    ))}
              </ul>
            </div>
          )}
        </main>

        {emptyType && <ArchiveEmptyState type={emptyType} />}
      </div>

      <AnimatePresence>
        {dreamToDelete && (
          <CalendarDialog
            key="delete-dream"
            title="정말 꿈을 삭제할까요?"
            confirmLabel={deleteMutation.isPending ? '삭제 중...' : '삭제'}
            isConfirmDisabled={deleteMutation.isPending}
            onCancel={closeDeleteDialog}
            onConfirm={handleDeleteConfirm}
          >
            <p className="w-full text-[14px] leading-[1.5] font-medium text-b-400">
              {deleteMutation.isError
                ? '삭제하지 못했어요. 다시 시도해 주세요.'
                : '삭제하면 다시 되돌릴 수 없어요.'}
            </p>
          </CalendarDialog>
        )}
      </AnimatePresence>
    </>
  );
}

export default DreamArchivePage;
