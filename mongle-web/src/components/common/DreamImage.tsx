import { useState } from 'react';

interface DreamImageProps {
  src: string;
  alt: string;
  className?: string; // 크기 · 모서리 등 바깥 상자 스타일
}

type ImageStatus = 'loading' | 'loaded' | 'error';

// AI 생성 꿈 이미지 공통 컴포넌트
// - 로딩 중: 스켈레톤(깜빡이는 회색 상자)
// - 실패: 안내 문구 + 다시 시도 버튼
// 캘린더 카드, 꿈 상세, 보관함 등에서 같이 사용
function DreamImage({ src, alt, className = '' }: DreamImageProps) {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setStatus('loading');
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
            onClick={handleRetry}
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
