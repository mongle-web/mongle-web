import { useQuery } from '@tanstack/react-query';

import {
  getComposition,
  getImageStyles,
  getWorldImage,
  getWorldImageUrl,
} from '@/features/dream-connect/api/dreamConnectApi';
import { hasWorldImage } from '@/features/dream-connect/types/dreamConnect';

// 결과 화면 쿼리는 모두 ['dreams', 'connect', 'world', worldId] 아래에 둠
// (다시 연결 · 이미지 생성 뒤 이 키를 다시 불러오면 화면 전체가 새로 고쳐짐)
const worldKey = (worldId: number) => ['dreams', 'connect', 'world', worldId];
const isValidId = (worldId: number) => Number.isInteger(worldId) && worldId > 0;

// 연결 상태 (원본 꿈 삭제로 이야기가 끊겼는지 확인용)
export const useWorldComposition = (worldId: number) =>
  useQuery({
    queryKey: [...worldKey(worldId), 'composition'],
    queryFn: () => getComposition(worldId),
    enabled: isValidId(worldId),
  });

// 세계관 이미지 상태 (한 번도 만들지 않았으면 서버가 없다고 응답 → null)
export const useWorldImage = (worldId: number) =>
  useQuery({
    queryKey: [...worldKey(worldId), 'image'],
    queryFn: () => getWorldImage(worldId).catch(() => null),
    enabled: isValidId(worldId),
  });

// 이미 만든 이미지 주소 (최대 5분 유효한 임시 주소, 이미지가 있을 때만 요청)
export const useWorldImageUrl = (worldId: number, image?: Parameters<typeof hasWorldImage>[0]) =>
  useQuery({
    queryKey: [...worldKey(worldId), 'image-url', image?.imageVersion],
    queryFn: () => getWorldImageUrl(worldId),
    enabled: isValidId(worldId) && hasWorldImage(image),
  });

// 화풍 목록 (서버 key)
export const useImageStyles = () =>
  useQuery({
    queryKey: ['image-styles'],
    queryFn: getImageStyles,
    staleTime: Infinity,
  });
