import circlePlusIcon from '@/assets/icons/calendar/circle-plus.svg';

interface AddDreamButtonProps {
  onClick: () => void;
}

// 빈 날짜를 선택했을 때 연월 오른쪽에 나타나는 "꿈 추가하기" 버튼
function AddDreamButton({ onClick }: AddDreamButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[31px] cursor-pointer items-center gap-1 rounded-full bg-p-100 px-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
    >
      <span className="text-[12px] leading-[1.5] font-medium text-b-800">꿈 추가하기</span>
      <img src={circlePlusIcon} alt="" className="size-4" />
    </button>
  );
}

export default AddDreamButton;
