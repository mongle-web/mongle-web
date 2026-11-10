import { BackHeader } from '@/components/common';

interface TermsDetail2Props {
  // "동의하기"를 눌렀을 때 (약관 시트로 돌아가며 이 항목을 동의 상태로)
  onAgree: () => void;
  // 뒤로 가기를 눌렀을 때 (동의 상태는 그대로 두고 약관 시트로 돌아감)
  onClose: () => void;
}

// 개인정보 수집·이용 동의 상세 (약관 동의 시트 위에 화면 전체로 띄움)
function TermsDetail2({ onAgree, onClose }: TermsDetail2Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="개인정보 수집·이용 동의"
      className="fixed inset-0 mx-auto flex max-w-[480px] flex-col bg-b-900"
    >
      <BackHeader title="개인정보 수집·이용 동의" onBack={onClose} />

      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <p className="whitespace-pre-line">{`(필수) 개인정보 수집·이용 동의


할로(HALO)(이하 "회사")는 몽글 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. 내용을 확인하신 뒤 동의해 주세요.


1. 수집하는 개인정보 항목

가. 회원가입 시 (카카오 로그인)
- 카카오 계정 이메일, 카카오 회원 번호(식별값)
- 닉네임

나. 서비스 이용 중
- 꿈 기록(꿈 내용, 감정, 키워드)
- AI 결과물(생성 이미지, 꿈 세계, 분석·해석 결과)
- 토큰 지급·사용 내역, 출석 기록

다. 토큰 결제 시
- 결제 시 입력하는 휴대전화 번호
- 결제 내역(상품, 금액, 결제 일시, 결제 수단 종류, 승인 번호), 환불 내역
- 카드 번호 등 결제 수단 정보는 결제대행사(페이앱)가 직접 처리하며, 회사는 저장하지 않습니다.

라. 서비스 이용 과정에서 자동으로 생성·수집되는 정보
- 접속 기록(IP 주소, 접속 일시), 쿠키, 브라우저·기기 정보, 서비스 이용 기록


2. 수집·이용 목적
- 회원 식별, 가입·로그인, 회원 관리
- 꿈 기록 저장과 AI 이미지 생성, 꿈 세계 만들기, 꿈 분석·해석 등 서비스 제공
- 토큰 충전·결제, 청약철회·환불 처리
- 문의 응대, 불만 처리, 분쟁 해결
- 부정 이용 방지, 서비스 안정성 확보 및 오류 개선


3. 보유·이용 기간
회원 탈퇴 시까지 보유하며, 탈퇴하면 지체 없이 파기합니다.
다만 아래 정보는 법령에 따라 정해진 기간 동안 보관한 뒤 파기합니다.
- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)
- 대금 결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)
- 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)
- 웹사이트 방문(접속) 기록: 3개월 (통신비밀보호법)


4. AI 처리에 관한 안내
- 꿈 기록은 AI 이미지 생성과 분석·해석을 위해 AI 서비스 제공 업체에 전달되어 처리됩니다.
- 회사는 꿈 기록을 AI 모델 학습에 이용하지 않습니다.
- 꿈 기록에 건강 상태, 주민등록번호, 연락처 등 민감한 정보나 다른 사람의 개인정보는 적지 않도록 주의해 주세요.


5. 동의를 거부할 권리
회원은 개인정보 수집·이용 동의를 거부할 수 있습니다. 다만 위 항목은 서비스 제공에 꼭 필요한 정보이므로, 동의하지 않으면 회원가입과 서비스 이용이 제한됩니다.


더 자세한 내용(처리 위탁, 국외 이전, 회원의 권리와 행사 방법, 개인정보 보호책임자 등)은 개인정보 처리방침에서 확인할 수 있습니다.`}</p>
      </main>

      {/* 동의하기 (약관 시트의 "동의하고 계속하기" 활성 상태와 같은 모양) */}
      <div className="px-5 pt-2 pb-[42px]">
        <button
          type="button"
          onClick={onAgree}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-p-500 p-2.5 shadow-[0_0_16px_0_rgba(255,255,255,0.25)]"
        >
          {/* 전역 button { font: inherit } 이 글자 클래스를 덮어써서 span에 지정 */}
          <span className="text-[16px] leading-[1.3] font-semibold text-b-200">동의하기</span>
        </button>
      </div>
    </div>
  );
}

export default TermsDetail2;
