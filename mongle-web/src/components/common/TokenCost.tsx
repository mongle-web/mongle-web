// 버튼 안에 표시하는 필요 토큰 (동전 아이콘 + 1)
// muted: 회색 동전 (예: "이미지 다시 생성하기")
// 꿈 기록(DreamRecordPage)에서 쓰던 것을 꿈 연결 등에서도 쓰도록 공통으로 분리
// TODO: 아이콘이 public/dream-record 에 있어서, 공통 위치(assets)로 옮길지 꿈 기록 담당과 협의
function TokenCost({ muted = false }: { muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <img src={`/dream-record/${muted ? 'coin-muted' : 'coin'}.svg`} alt="" className="shrink-0" />
      <span>1</span>
    </span>
  );
}

export default TokenCost;
