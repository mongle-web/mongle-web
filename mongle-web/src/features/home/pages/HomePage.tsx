import { useNavigate } from 'react-router-dom';

import homeAd from '@/assets/images/home/home_ad.png';
import homeLink from '@/assets/images/home/home_link.png';

import { Header } from '@/components/common';

import BottomNavigation from '@/features/home/components/BottomNavigation';
import HomeHeroCard from '@/features/home/components/HomeHeroCard';
import QuickActionCard from '@/features/home/components/QuickActionCard';
import RecentDreamCard from '@/features/home/components/RecentDreamCard';
import RecordButton from '@/features/home/components/RecordButton';
import { recentDreams } from '@/features/home/mocks/homeMockData';

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative isolate min-h-screen bg-b-900 px-5 pt-[14px] pb-28">
        {/* 상단 배경 빛 */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-screen w-full max-w-[480px] bg-radial-[92.2%_47.65%_at_50%_0%] from-p-500/40 to-p-500/0"
        />

        <Header />

        <div className="mt-6">
          <HomeHeroCard />
        </div>

        {/* 주요 기능 */}
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

        {/* 최근 꿈 */}
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
        </section>
      </div>

      <BottomNavigation />

      {/* 음성/텍스트 선택 단계 없이 기록 화면으로 직접 이동 */}
      <RecordButton onClick={() => navigate('/dreams/new')} />
    </>
  );
}

export default HomePage;
