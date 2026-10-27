// 캐릭터 뒤 빛 번짐 (피그마: 타원 14.85° 회전)
// 위치(top 등)는 className으로 화면마다 지정
// 꿈 기록(DreamRecordPage)에서 쓰던 것을 꿈 연결 등에서도 쓰도록 공통으로 분리
// TODO: 이미지가 public/dream-record 에 있어서, 공통 위치(assets)로 옮길지 꿈 기록 담당과 협의
function Glow({ className = '' }: { className?: string }) {
  return (
    <img
      src="/dream-record/glow.svg"
      alt=""
      aria-hidden="true"
      className={[
        'pointer-events-none absolute left-[calc(50%-8px)]',
        'max-w-none -translate-x-1/2 rotate-[14.85deg]',
        className,
      ].join(' ')}
    />
  );
}

export default Glow;
