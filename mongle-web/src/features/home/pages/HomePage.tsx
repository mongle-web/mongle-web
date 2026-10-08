import { useState } from 'react';

import homeAd from '@/assets/images/home/home_ad.png';
import homeLink from '@/assets/images/home/home_link.png';

import BottomNavigation from '@/features/home/components/BottomNavigation';
import HomeHeroCard from '@/features/home/components/HomeHeroCard';
import QuickActionCard from '@/features/home/components/QuickActionCard';
import RecentDreamCard from '@/features/home/components/RecentDreamCard';
import RecordButton from '@/features/home/components/RecordButton';
import RecordMethodSheet from '@/features/home/components/RecordMethodSheet';
import { recentDreams } from '@/features/home/mocks/homeMockData';

function HomePage() {
  const [isRecordSheetOpen, setIsRecordSheetOpen] = useState(false);

  return (
    <>
      {/* isolate: 배경색(b-900) → 보라색 빛(-z-10) → 콘텐츠 순서로 쌓이도록 별도 레이어 생성 */}
      <div className="relative isolate min-h-screen bg-b-900 px-4 pt-5 pb-28">
        {/* 상단 보라색 빛 (화면 높이 기준 크기, 스크롤해도 화면 위쪽에 고정) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-screen w-full max-w-[480px] bg-radial-[92.2%_47.65%_at_50%_0%] from-p-500/40 to-p-500/0"
        />

        <header className="mb-6 flex items-center justify-between">
          <span className="text-[16px] font-medium tracking-[-0.02em] text-[#F7F5FA]">logo</span>

          <button
            type="button"
            aria-label="프로필"
            className="flex h-9 w-9 items-center justify-center text-[#D3CEDD]"
          >
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-4 3-7 7-7s7 3 7 7v1H5z" />
            </svg>
          </button>
        </header>

        <HomeHeroCard />

        <section className="mt-4 flex flex-col gap-2">
          <QuickActionCard
            title="꿈의 연결고리 찾기"
            description="겹쳐진 꿈을 이어 나만의 이야기를 만들어 보세요."
            image={homeLink}
            imageClassName="h-[62px] w-[92px]"
          />

          <QuickActionCard
            title="무료 토큰 받기"
            description="광고를 시청하고 꿈 이미지 생성 토큰을 받아보세요."
            image={homeAd}
            imageClassName="h-[58px] w-[82px]"
          />
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#F7F5FA]">지난 꿈 돌아보기</h2>

            <button
              type="button"
              aria-label="지난 꿈 전체 보기"
              className="flex h-8 w-8 items-center justify-center text-[#F7F5FA]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentDreams.map((dream) => (
              <RecentDreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        </section>
      </div>

      <BottomNavigation />

      <RecordButton onClick={() => setIsRecordSheetOpen(true)} />

      <RecordMethodSheet isOpen={isRecordSheetOpen} onClose={() => setIsRecordSheetOpen(false)} />
    </>
  );
}

export default HomePage;
