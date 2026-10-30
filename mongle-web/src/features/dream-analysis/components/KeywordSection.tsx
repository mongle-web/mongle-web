export interface KeywordStat {
  keyword: string;
  count: number;
}

interface KeywordSectionProps {
  keywords: KeywordStat[];
}

const BOX_HEIGHT = 540;
// 건수가 적어도 "1건 / 키워드" 글자가 들어가도록 최소 높이 보장
const MIN_CARD_HEIGHT = 110;
// 디자인상 상위 5개만 표시
const MAX_VISIBLE_COUNT = 5;

// 키워드 카드 하나 (건수 비율로 열 높이를 나눠 가짐)
function KeywordCard({ keyword, count }: KeywordStat) {
  return (
    <li
      className="flex min-w-0 flex-col items-start justify-end self-stretch rounded-[24px] bg-[linear-gradient(180deg,rgba(65,62,88,0.80)_0%,rgba(65,62,88,0.15)_100%)] p-5"
      style={{ flexGrow: count, flexBasis: 0, minHeight: MIN_CARD_HEIGHT }}
    >
      <span className="text-[14px] leading-[1.5] font-medium text-b-600">{count}건</span>
      <span className="w-full truncate text-[20px] leading-[1.5] font-semibold text-b-300">
        {keyword}
      </span>
    </li>
  );
}

// 짧은 열에 하나씩 쌓기: 많은 순으로 건수 합이 더 작은 열에 넣음
const splitIntoColumns = (keywords: KeywordStat[]) => {
  const left: KeywordStat[] = [];
  const right: KeywordStat[] = [];
  let leftSum = 0;
  let rightSum = 0;

  keywords.forEach((item, index) => {
    if (index === 0 || leftSum < rightSum) {
      left.push(item);
      leftSum += item.count;
    } else {
      right.push(item);
      rightSum += item.count;
    }
  });

  return [left, right];
};

// 자주 나타난 키워드
function KeywordSection({ keywords }: KeywordSectionProps) {
  // 많은 순 정렬 (sort는 동점일 때 원래 순서 유지), 상위 5개만
  const visibleKeywords = [...keywords]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_VISIBLE_COUNT);
  const columns = splitIntoColumns(visibleKeywords);

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="text-[16px] leading-[1.5] font-medium text-b-200">자주 나타난 키워드</h2>

      {visibleKeywords.length > 0 ? (
        <div className="flex w-full" style={{ height: BOX_HEIGHT }}>
          {columns.map((column, columnIndex) => (
            <ul key={columnIndex} className="flex min-w-0 flex-1 flex-col">
              {column.map((item) => (
                <KeywordCard key={item.keyword} {...item} />
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="px-4 py-10 text-center text-[14px] leading-[1.5] font-semibold text-b-400">
          아직 기록된 키워드가 없어요
        </p>
      )}
    </section>
  );
}

export default KeywordSection;
