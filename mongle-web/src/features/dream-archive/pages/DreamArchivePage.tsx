import { useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { BackHeader } from '@/components/common';
import CalendarDialog from '@/features/calendar/components/CalendarDialog';
import { useDeleteDream } from '@/features/calendar/hooks/useDeleteDream';
import ArchiveDreamCard from '@/features/dream-archive/components/ArchiveDreamCard';
import ArchiveSearchBar from '@/features/dream-archive/components/ArchiveSearchBar';
import ArchiveTabs from '@/features/dream-archive/components/ArchiveTabs';
import {
  useArchiveDreams,
  useConnectedDreams,
} from '@/features/dream-archive/hooks/useArchiveDreams';
import { useDeleteConnectedDream } from '@/features/dream-archive/hooks/useDeleteConnectedDream';
import type { ArchiveDream, ArchiveTab } from '@/features/dream-archive/types/dreamArchive';

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

// 지난 꿈 보관함 "지난 꿈 돌아보기" (/archive)
function DreamArchivePage() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<ArchiveTab>('recorded');
  const [search, setSearch] = useState('');
  const [dreamToDelete, setDreamToDelete] = useState<ArchiveDream | null>(null);

  // TODO: 불러오는 중 / 불러오기 실패 / 꿈이 없을 때 / 검색 결과가 없을 때 화면은 피그마 디자인 요청 중
  const { data: recordedDreams = [] } = useArchiveDreams();
  const { data: connectedDreams = [] } = useConnectedDreams();

  const deleteDreamMutation = useDeleteDream();
  const deleteConnectedMutation = useDeleteConnectedDream();
  const deleteMutation = selectedTab === 'recorded' ? deleteDreamMutation : deleteConnectedMutation;

  const closeDeleteDialog = () => {
    deleteMutation.reset(); // 이전 실패 메시지 지우기
    setDreamToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!dreamToDelete) return;

    deleteMutation.mutate(dreamToDelete.id, {
      onSuccess: () => setDreamToDelete(null),
    });
  };

  return (
    <>
      <div className="min-h-dvh bg-b-900">
        <BackHeader title="지난 꿈 돌아보기" />

        {/* 피그마: 위 20 · 좌우 20 · 아래 64, 탭과 목록 사이 28 */}
        <main className="flex flex-col gap-7 px-5 pt-5 pb-16">
          <ArchiveTabs selectedTab={selectedTab} onChange={setSelectedTab} />

          {/* 피그마: 검색창과 카드 목록 사이 12, 카드 사이 8 */}
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
                      {/* TODO: 꿈 연결 결과 화면이 생기면 카드 클릭 시 이동 */}
                      <ArchiveDreamCard
                        dream={dream}
                        connectedDreamTitles={dream.connectedDreamTitles}
                        onDelete={() => setDreamToDelete(dream)}
                      />
                    </li>
                  ))}
            </ul>
          </div>
        </main>
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
