interface ConnectTagCardProps {
  title: string; // '공통 키워드' 또는 '반복되는 감정'
  tags: string[];
}

// 공통 키워드 · 반복되는 감정 카드
// 피그마: 배경 N-900, 모서리 24, 여백 20, 제목과 태그 사이 16
// 제목 12 Medium B-200 / 태그: 배경 N-800, 모서리 8, 여백 가로 12 · 세로 6, 12 Regular B-200, 태그 사이 8
// (꿈 상세의 감정 · 키워드 카드와 글자 · 태그는 같고 배경만 단색)
function ConnectTagCard({ title, tags }: ConnectTagCardProps) {
  if (tags.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-n-900 p-5">
      <h3 className="text-[12px] leading-[1.5] font-medium text-b-200">{title}</h3>

      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-[8px] bg-n-800 px-3 py-1.5 text-[12px] leading-[1.5] text-b-200"
          >
            {tag}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ConnectTagCard;
