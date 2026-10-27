import { Header } from '@/components/common';

import BottomNavigation from '@/features/home/components/BottomNavigation';
import DreamAnalyzeCard from '@/features/home/components/DreamAnalyzeCard';
import HomeHeroCard from '@/features/home/components/HomeHeroCard';
import HomeMenuCard from '@/features/home/components/HomeMenuCard';
import { useAuth } from '@/hooks/useAuth';
// import RecentDreamCard from '@/features/home/components/RecentDreamCard';
// import { recentDreams } from '@/features/home/mocks/homeMockData';

function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <div className="relative isolate min-h-screen bg-b-900 px-5 pt-[14px] pb-28">
        {/* 상단 배경 빛 */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-screen w-full max-w-[480px] bg-radial-[92.2%_47.65%_at_50%_0%] from-p-500/40 to-p-500/0"
        />

        <Header />

        <h1 className="mt-6 text-[20px] leading-[1.4] font-semibold text-b-200">
          {isLoggedIn ? '밤사이' : '꿈속 이야기를'}
          <br />
          {isLoggedIn ? '어떤 일이 있었나요?' : '몽글과 함께 기록해 볼까요?'}
        </h1>

        <div className="mt-3">
          <HomeHeroCard isLoggedIn={isLoggedIn} />
        </div>

        <section className="mt-5 flex flex-col gap-2">
          {/* TODO: 임시 키워드 */}
          <DreamAnalyzeCard keyword="불안" isLoggedIn={isLoggedIn} />

          {/* 피그마: 카드 사이 8px */}
          <div className="grid grid-cols-2 gap-2">
            <HomeMenuCard type="link" isLoggedIn={isLoggedIn} />
            <HomeMenuCard type="archive" isLoggedIn={isLoggedIn} />
          </div>
        </section>

        {/* 최근 꿈 (새 디자인 적용 중 임시 주석 처리)
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

          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentDreams.map((dream) => (
              <RecentDreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        </section> */}
      </div>

      <BottomNavigation />
    </>
  );
}

export default HomePage;
