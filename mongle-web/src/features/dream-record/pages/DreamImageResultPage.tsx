
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DreamImageResultState {
  imageUrl: string;
  saved?: boolean;
}

function isImageResultState(value: unknown): value is DreamImageResultState {
  if (!value || typeof value !== 'object' || !('imageUrl' in value)) {
    return false;
  }

  const imageUrl = value.imageUrl;

  return (
    typeof imageUrl === 'string' &&
    /^(https?:\/\/|blob:)/.test(imageUrl)
  );
}

function DreamImageResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = isImageResultState(location.state)
    ? location.state
    : null;

  const [imageStatus, setImageStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');

  return (
    <div className="flex min-h-dvh flex-col bg-b-900 text-b-200">
      <main className="flex flex-1 flex-col items-center px-5 pt-[140px]">
        {result ? (
          <>
            <div className="text-center">
              <h1 className="text-[20px] leading-[1.4] font-semibold">
                꿈 이미지가 완성되었어요
              </h1>

              <p className="mt-3 text-[16px] leading-[1.5] text-b-400">
                {result.saved
                  ? '보관함에 소중히 담아두었어요.'
                  : '생성된 꿈 이미지를 확인해 보세요.'}
              </p>
            </div>

            <div className="relative mt-[60px] w-full overflow-hidden rounded-[16px] bg-n-900">
              {imageStatus === 'loading' && (
                <div
                  role="status"
                  className="absolute inset-0 flex items-center justify-center text-[14px] text-b-400"
                >
                  이미지를 불러오고 있어요...
                </div>
              )}

              {imageStatus === 'error' && (
                <div
                  role="alert"
                  className="absolute inset-0 flex items-center justify-center text-[14px] text-b-400"
                >
                  이미지를 불러오지 못했습니다.
                </div>
              )}

              <img
                src={result.imageUrl}
                alt="AI가 생성한 꿈 이미지"
                onLoad={() => setImageStatus('success')}
                onError={() => setImageStatus('error')}
                className={[
                  'aspect-[353/200] w-full object-cover',
                  imageStatus === 'success' ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              />
            </div>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-[20px] font-semibold">
              아직 생성된 이미지가 없어요
            </h1>

            <p className="mt-3 text-[14px] leading-[1.6] text-b-400">
              꿈 기록 화면에서 이미지를 생성하면
              <br />
              이곳에서 결과를 확인할 수 있어요.
            </p>
          </div>
        )}
      </main>

      <footer className="px-5 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-14 w-full items-center justify-center rounded-[16px] border-2 border-white/30 bg-p-500 text-[16px] font-semibold text-b-200 shadow-[0_0_8px_rgba(255,255,255,0.25)] transition-colors active:bg-p-900"
        >
          홈으로 돌아가기
        </button>
      </footer>
    </div>
  );
}

export default DreamImageResultPage;
