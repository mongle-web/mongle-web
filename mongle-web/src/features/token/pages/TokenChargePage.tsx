import { BackHeader } from '@/components/common';
import CreditCharge from '@/components/common/CreditCharge';

// 토큰 충전 페이지 (홈 헤더 토큰 아이콘에서 진입)
// 충전 화면은 꿈 기록 · 꿈 연결과 같은 공통 CreditCharge 사용
// 여기서는 충전만 하므로 이미지 생성으로 이어지지 않음 (cost 0, canGenerate false)
function TokenChargePage() {
  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="토큰 충전" />

      <main className="px-5 pt-5">
        <CreditCharge
          storageKey="mongle:payment-pending:token"
          cost={0}
          canGenerate={false}
          onContinue={() => {}}
        />
      </main>
    </div>
  );
}

export default TokenChargePage;
