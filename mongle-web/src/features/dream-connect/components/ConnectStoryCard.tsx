import aiIcon from '@/assets/icons/dream-connect/ai.svg';

interface ConnectStoryCardProps {
  paragraphs: string[];
}

// 몽글의 꿈 연결 스토리 카드
// 피그마: 배경 N-900, 모서리 24, 여백 20, 제목줄과 본문 사이 12
// 제목줄: 아이콘 16 + 8 + 14 Medium B-200 / 본문: 14 Medium B-400, 문단 사이 한 줄 띄움
function ConnectStoryCard({ paragraphs }: ConnectStoryCardProps) {
  return (
    <section className="flex w-full flex-col gap-3 rounded-3xl bg-n-900 p-5">
      <h3 className="flex items-center gap-2 text-[14px] leading-[1.5] font-medium text-b-200">
        <img src={aiIcon} alt="" className="size-4 shrink-0" />
        몽글의 꿈 연결 스토리
      </h3>

      <p className="text-[14px] leading-[1.5] font-medium whitespace-pre-line text-b-400">
        {paragraphs.join('\n\n')}
      </p>
    </section>
  );
}

export default ConnectStoryCard;
