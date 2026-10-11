import { useNavigate } from 'react-router-dom';

// 꿈 기록하기 버튼 (피그마: 너비 313, 높이 45)
// 위치는 쓰는 쪽에서 정하고, 버튼은 부모 너비를 꽉 채움
// 피그마 유리 효과는 CSS로 근사: 뒤 배경 흐림 + 왼쪽 위 하이라이트
function RecordButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dreams/new');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-p-500/40 px-5 py-3 text-[16px] leading-[1.3] font-semibold text-b-200 shadow-[0_0_20px_0_rgba(255,255,255,0.30),inset_1px_1px_0_0_rgba(255,255,255,0.4)] backdrop-blur-[12px]"
    >
      꿈 기록하기
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5 shrink-0">
        <path
          d="M10 4.16663V15.8333M4.1665 10H15.8332"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default RecordButton;
