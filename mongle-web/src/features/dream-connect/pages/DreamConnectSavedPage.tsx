import { useNavigate } from 'react-router-dom';

import { Glow, PrimaryButton } from '@/components/common';

// 꿈 연결하기 - 이미지 없이 저장 완료 (/connect/:worldId/saved)
// 피그마: iPhone 16 - 102 (꿈 기록의 "기록한 꿈을 저장했어요"와 같은 캐릭터 · 빛 번짐)
// 피그마 좌표 기준으로 화면 맨 위 = 0에 절대 위치로 배치
// - 문구: 위 154, 너비 200, 가로 가운데 +0.5, 제목 20 SemiBold · 설명 16 Medium B-400, 사이 12
// - 캐릭터: 위 285, 188×169, 가로 가운데 +9.5
// - 빛 번짐: 중심 (가운데 -8, 372.26) → glow.svg(402.92×354.009) 위 195.26
function DreamConnectSavedPage() {
  const navigate = useNavigate();

  return (
    // 빛 번짐이 화면 밖으로 나가도 가로 스크롤이 생기지 않게 overflow-x-clip
    <div className="relative min-h-dvh overflow-x-clip bg-b-900">
      {/* global.css의 img { max-width: 100% } 때문에 빛 번짐이 줄어들지 않도록 max-w-none! */}
      <Glow className="top-[195.26px] max-w-none!" />

      <div className="absolute top-[154px] left-[calc(50%+0.5px)] flex w-[200px] -translate-x-1/2 flex-col items-center gap-3 text-center">
        <h1 className="text-[20px] leading-[1.4] font-semibold whitespace-nowrap text-b-200">
          연결한 꿈을 저장했어요
        </h1>
        <p className="text-[16px] leading-[1.5] font-medium whitespace-nowrap text-b-400">
          보관함에 소중히 담아두었어요.
        </p>
      </div>

      <img
        src="/dream-record/saved.png"
        alt="연결한 꿈을 반기는 몽글"
        className="pointer-events-none absolute top-[285px] left-[calc(50%-84.5px)] h-[169px] w-[188px] max-w-none object-cover"
      />

      {/* 피그마: 화면 아래에서 42 위 (8 + 홈 인디케이터 34) */}
      <div className="fixed right-0 bottom-0 left-0 z-10">
        <div className="mx-auto w-full max-w-[480px] px-5 pb-[42px]">
          <PrimaryButton onClick={() => navigate('/', { replace: true })}>
            홈으로 돌아가기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default DreamConnectSavedPage;
