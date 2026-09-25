import type { RecentDream } from '@/features/home/mocks/homeMockData';

interface RecentDreamCardProps {
  dream: RecentDream;
}

function RecentDreamCard({ dream }: RecentDreamCardProps) {
  return (
    <button
      type="button"
      className="relative h-[92px] w-[210px] shrink-0 overflow-hidden rounded-[20px] bg-[#24212E] text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#292635] via-[#4C4957] to-[#CAC9CF]" />

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex h-full flex-col justify-end p-4">
        <p className="truncate text-[12px] font-medium text-white">{dream.title}</p>

        <p className="mt-1 text-[9px] text-white/55">{dream.date}</p>
      </div>
    </button>
  );
}

export default RecentDreamCard;
