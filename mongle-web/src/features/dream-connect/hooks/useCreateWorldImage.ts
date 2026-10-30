import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createWorldImage,
  getComposition,
  getCreditBalance,
  getWorldImage,
  getWorldImageUrl,
} from '@/features/dream-connect/api/dreamConnectApi';
import { hasWorldImage, IMAGE_TOKEN_COST } from '@/features/dream-connect/types/dreamConnect';
import type { WorldImage } from '@/features/dream-connect/types/dreamConnect';
import { isJobInProgress, isTimeoutError, pollJob } from '@/features/dream-connect/utils/polling';

type ImageStatus = 'idle' | 'generating' | 'noTokens' | 'error';

// 이번 이미지에 필요한 토큰 수 (이전에 성공한 이미지가 있으면 서버가 알려준 재생성 비용)
export const getRequiredTokens = (previous?: WorldImage | null) =>
  hasWorldImage(previous) ? (previous?.nextRegenerationCost ?? IMAGE_TOKEN_COST) : IMAGE_TOKEN_COST;

// 필요한 토큰 · 보유 토큰 ("토큰이 부족해요!" 모달에 표시)
export interface TokenCheck {
  required: number;
  owned: number;
  isEnough: boolean;
}

// 토큰이 충분한지 (결과 화면에서 화풍 선택으로 넘어가기 전에 확인, 디자이너: 비용은 이전 화면에서 확인)
export const checkTokens = async (worldId: number): Promise<TokenCheck> => {
  const before = await getWorldImage(worldId).catch(() => null);
  const required = getRequiredTokens(before);
  const owned = await getCreditBalance();
  return { required, owned, isEnough: owned >= required };
};

// 연결한 꿈 이미지 만들기 (화풍 선택 화면 "그림 완성하기")
// 1) 토큰 확인(처음 3 · 재생성은 서버가 알려준 비용) → 2) 고른 화풍으로 이미지 생성 시작 → 3) 완료될 때까지 상태 확인 → 4) 이미지 주소 받기
// 생성 중 모달을 닫아도 서버에서는 계속 만들어지므로(토큰도 사용됨) 화면에서도 계속 기다렸다가 완료되면 이동
export const useCreateWorldImage = (worldId: number, onCompleted: (imageUrl: string) => void) => {
  const [status, setStatus] = useState<ImageStatus>('idle');
  // 토큰이 부족할 때 모달에 보여줄 값
  const [tokenCheck, setTokenCheck] = useState<TokenCheck | null>(null);
  const isRunningRef = useRef(false);
  const isUnmountedRef = useRef(false);

  // 화면을 벗어나면 상태 확인 중단
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const generate = useCallback(
    async (style: string) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        // 생성 요청 전 이미지 상태 (처음 만드는 경우 없을 수 있음, 재생성 여부 · 새 작업인지 비교용)
        const before = await getWorldImage(worldId).catch(() => null);

        const required = getRequiredTokens(before);
        const owned = await getCreditBalance();
        if (owned < required) {
          setTokenCheck({ required, owned, isEnough: false });
          setStatus('noTokens');
          return;
        }

        setStatus('generating');

        const { compositionRevision } = await getComposition(worldId);

        try {
          await createWorldImage(worldId, compositionRevision, style, before);
        } catch (error) {
          // 제한시간 초과는 서버에 접수됐을 수 있어서 다시 보내지 않고(토큰 중복 사용 방지) 상태 확인으로 넘어감
          if (!isTimeoutError(error)) throw error;
        }

        const image = await pollJob({
          fetchStatus: () => getWorldImage(worldId),
          isCancelled: () => isUnmountedRef.current,
          // 진행 중이면 이번 요청, 끝난 상태면 요청 전과 다른 새 이미지일 때만
          isRequestedJob: (current) =>
            isJobInProgress(current) || current.imageVersion !== before?.imageVersion,
        });
        if (!image) return;

        const imageUrl = await getWorldImageUrl(worldId);
        if (!isUnmountedRef.current) onCompleted(imageUrl);
      } catch {
        if (!isUnmountedRef.current) setStatus('error');
      } finally {
        isRunningRef.current = false;
      }
    },
    [worldId, onCompleted],
  );

  // 실패 모달 · 토큰 부족 안내를 닫을 때
  const resetStatus = useCallback(() => setStatus('idle'), []);

  return { status, generate, resetStatus, tokenCheck, isGenerating: status === 'generating' };
};
