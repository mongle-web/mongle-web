import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createWorldImage,
  getComposition,
  getCreditBalance,
  getWorldImage,
  getWorldImageUrl,
} from '@/features/dream-connect/api/dreamConnectApi';
import { IMAGE_TOKEN_COST } from '@/features/dream-connect/types/dreamConnect';

// 이미지 상태를 몇 초마다 확인할지
const POLLING_INTERVAL_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ImageStatus = 'idle' | 'generating' | 'noTokens' | 'error';

// 연결한 꿈 "그림으로 남기기"
// 1) 토큰 확인 → 2) 이미지 생성 시작 → 3) 완료될 때까지 상태 확인 → 4) 이미지 주소 받기
// 생성 중 모달을 닫아도 서버에서는 계속 만들어지므로(토큰도 사용됨) 화면에서도 계속 기다렸다가 완료되면 이동
export const useCreateWorldImage = (worldId: number, onCompleted: (imageUrl: string) => void) => {
  const [status, setStatus] = useState<ImageStatus>('idle');
  const isRunningRef = useRef(false);
  const isUnmountedRef = useRef(false);

  // 화면을 벗어나면 상태 확인 중단
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const generate = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    try {
      const credits = await getCreditBalance();
      if (credits < IMAGE_TOKEN_COST) {
        setStatus('noTokens');
        return;
      }

      setStatus('generating');

      const { compositionRevision } = await getComposition(worldId);
      await createWorldImage(worldId, compositionRevision);

      while (!isUnmountedRef.current) {
        await sleep(POLLING_INTERVAL_MS);
        const image = await getWorldImage(worldId);

        if (image.status === 'COMPLETED') {
          const imageUrl = await getWorldImageUrl(worldId);
          if (!isUnmountedRef.current) onCompleted(imageUrl);
          return;
        }

        if (image.status === 'FAILED') throw new Error(image.failureCode);
      }
    } catch {
      if (!isUnmountedRef.current) setStatus('error');
    } finally {
      isRunningRef.current = false;
    }
  }, [worldId, onCompleted]);

  return { status, generate, isGenerating: status === 'generating' };
};
