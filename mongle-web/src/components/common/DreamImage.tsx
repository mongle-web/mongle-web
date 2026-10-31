import { useState } from 'react';
import type { MouseEvent } from 'react';

interface DreamImageProps {
  src: string;
  alt: string;
  className?: string; // 크기 · 모서리 등 바깥 상자 스타일
  onRetry?: () => void | Promise<unknown>;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

// AI 생성 꿈 이미지 공통 컴포넌트
// - 로딩 중: 스켈레톤(깜빡이는 회색 상자)
// - 실패: 안내 문구 + 다시 시도 버튼
// 캘린더 카드, 꿈 상세, 보관함 등에서 같이 사용
function DreamImage({ src, alt, className = '', onRetry }: DreamImageProps) {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // 카드 안에 있을 때 카드 클릭(이동)으로 번지지 않게
    setStatus('loading');

    try {
      await onRetry?.();
    } catch {
      // 새 임시 URL 발급 실패와 파일 표시 실패를 섞지 않고 기존 주소 재시도도 허용한다.
    }

    setRetryCount((count) => count + 1); // key가 바뀌면 <img>를 새로 만들어 다시 요청
  };

  return (
    <div className={['relative overflow-hidden bg-n-800', className].join(' ')}>
      {status === 'loading' && (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-n-800" />
      )}

      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-[12px] text-b-400">이미지를 불러오지 못했어요</p>
          <button
            type="button"
            onClick={(event) => void handleRetry(event)}
            className="h-7 cursor-pointer rounded-full bg-p-100 px-3 text-[12px] font-medium text-b-800"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <img
          key={retryCount}
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={[
            'absolute inset-0 size-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}
    </div>
  );
}

export default DreamImage;
