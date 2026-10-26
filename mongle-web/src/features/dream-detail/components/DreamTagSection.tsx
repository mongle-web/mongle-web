interface DreamTagSectionProps {
  title: string; // '감정' 또는 '키워드'
  tags: string[];
}

// 감정 · 키워드 태그 카드
function DreamTagSection({ title, tags }: DreamTagSectionProps) {
  if (tags.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-linear-to-b from-n-800/80 to-n-800/15 p-5">
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

export default DreamTagSection;
