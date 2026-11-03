import { useState } from 'react';

import { FlowModal } from '@/components/common';
import {
  canOpenExternally,
  openInExternalBrowser,
  type InAppBrowser,
} from '@/features/login/utils/inAppBrowser';

interface ExternalBrowserModalProps {
  browser: InAppBrowser;
  onClose: () => void;
}

// 인앱 브라우저에서 로그인하려고 할 때 띄우는 안내 모달
// - 카카오톡 · 안드로이드: "외부 브라우저로 열기" 버튼으로 바로 이동
// - 아이폰 인스타그램 등: 코드로 열 수 없어서 메뉴 위치를 안내하고 링크 복사 제공
// TODO: 피그마 디자인이 없어서 FlowModal · 토큰 부족 모달의 버튼 모양을 그대로 사용, 문구 · 모양은 디자이너 확인
function ExternalBrowserModal({ browser, onClose }: ExternalBrowserModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const canOpen = canOpenExternally(browser);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setIsCopied(true);
    } catch {
      // 복사가 막힌 환경이면 버튼 문구를 그대로 둠 (메뉴 안내로 외부 브라우저 열기)
      setIsCopied(false);
    }
  };

  return (
    <FlowModal title="외부 브라우저에서 열어 주세요" onClose={onClose} animate>
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-[18px] leading-[1.4] font-semibold">
            외부 브라우저에서
            <br />
            열어 주세요
          </h2>
          <p className="text-[14px] leading-[1.5] font-medium break-keep text-b-400">
            {canOpen ? (
              <>앱 안의 브라우저에서는 로그인이 유지되지 않아요.</>
            ) : (
              <>
                오른쪽 위 ⋯ 메뉴에서
                <br />
                &apos;외부 브라우저에서 열기&apos;를
                <br />
                눌러 주세요.
              </>
            )}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          {canOpen ? (
            <button
              type="button"
              onClick={() => openInExternalBrowser()}
              className="h-9 w-full rounded-lg border border-white/40 bg-p-500 px-3 text-[14px] leading-[1.3] font-semibold"
            >
              외부 브라우저로 열기
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="h-9 w-full rounded-lg border border-white/40 bg-p-500 px-3 text-[14px] leading-[1.3] font-semibold"
            >
              {isCopied ? '링크를 복사했어요' : '링크 복사하기'}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full rounded-lg border border-white/40 bg-p-100 px-3 text-[14px] leading-[1.3] font-semibold text-[#a09dbe]"
          >
            닫기
          </button>
        </div>
      </div>
    </FlowModal>
  );
}

export default ExternalBrowserModal;
