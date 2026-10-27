import { useQuery } from '@tanstack/react-query';

import { getArchiveDreams, getConnectedDreams } from '@/features/dream-archive/api/dreamArchiveApi';

// 보관함 "기록한 꿈" 목록
// 꿈 삭제 · 수정 시 ['dreams']로 시작하는 쿼리가 다시 불러와지므로 키를 'dreams' 아래에 둔다
export const useArchiveDreams = () => {
  return useQuery({
    queryKey: ['dreams', 'archive', 'recorded'],
    queryFn: getArchiveDreams,
  });
};

// 보관함 "연결된 꿈" 목록
export const useConnectedDreams = () => {
  return useQuery({
    queryKey: ['dreams', 'archive', 'connected'],
    queryFn: getConnectedDreams,
  });
};
