import searchIcon from '@/assets/icons/dream-archive/search.svg';

interface ArchiveSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

// 지난 꿈 검색창
// 피그마: 배경 N-800, 모서리 12, 여백 가로 12 · 세로 8, 아이콘 20, 아이콘과 글자 사이 8
// 안내 문구 14 Medium B-600, 입력한 글자는 B-200
function ArchiveSearchBar({ value, onChange }: ArchiveSearchBarProps) {
  return (
    <label className="flex w-full items-center gap-2 rounded-[12px] bg-n-800 px-3 py-2">
      <img src={searchIcon} alt="" className="size-5 shrink-0" />
      <input
        type="text"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="지난 꿈 검색하기"
        aria-label="지난 꿈 검색하기"
        // global.css의 input { font: inherit } 보다 우선하도록 글자 스타일에 ! 사용
        className="min-w-0 flex-1 bg-transparent text-[14px]! leading-[1.5]! font-medium! text-b-200 outline-none placeholder:text-b-600"
      />
    </label>
  );
}

export default ArchiveSearchBar;
