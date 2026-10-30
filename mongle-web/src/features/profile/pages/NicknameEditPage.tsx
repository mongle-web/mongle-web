import { useState } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';

import { updateNickname } from '@/api/userApi';
import { LOGIN_PATH, useAuth } from '@/hooks/useAuth';

// 닉네임 규칙 (닉네임 온보딩 페이지와 같음)
// 2~10자, 한글(완성형) · 영문 · 숫자만 허용 (공백 · 특수문자 불가)
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
// 허용 안 되는 문자 검사 (한글 입력 중인 자음 · 모음은 에러로 보지 않음)
const INVALID_CHAR_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/;
const MAX_LENGTH = 10;

const PROFILE_PATH = '/profile';

// 마이페이지 닉네임 수정 (마이페이지 편집 배지에서 진입)
function NicknameEditPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, updateUser } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);

  const isChanged = nickname !== (user?.nickname ?? '');
  const isValid = NICKNAME_REGEX.test(nickname);
  // 빈 칸 · 허용 안 되는 문자 · 10자 초과는 에러 (1자 · 입력 중인 자음 모음은 문구 없이 저장만 막음)
  const isError =
    nickname.length === 0 || INVALID_CHAR_REGEX.test(nickname) || nickname.length > MAX_LENGTH;

  const handleBack = () => {
    navigate(-1);
  };

  // 저장 버튼은 항상 같은 모양, 규칙을 통과하지 못하면 눌러도 저장하지 않음
  const handleSave = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setIsSubmitError(false);

    try {
      const updatedUser = await updateNickname(nickname);
      updateUser(updatedUser);
      navigate(PROFILE_PATH, { replace: true });
    } catch {
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  // 입력 칸 아래 안내 문구 (처음 · 바꾸지 않았을 때는 없음)
  const helper = (() => {
    if (isSubmitError) {
      return { text: '닉네임을 저장하지 못했어요. 다시 시도해 주세요.', isError: true };
    }
    if (!isChanged) return null;
    if (isValid) return { text: '사용가능한 닉네임입니다.', isError: false };
    if (isError) return { text: '2~10자 입력 가능, 특수문자 사용 불가', isError: true };
    return null;
  })();

  return (
    <div className="min-h-dvh bg-b-900">
      {/* 상단 바 (뒤로가기 · 제목 · 저장, BackHeader와 같은 크기) */}
      <header className="flex items-center justify-between px-5 py-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="이전 화면"
          className="size-7 cursor-pointer text-b-200"
        >
          <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="size-7">
            <path
              d="M15.1665 7L8.1665 14L15.1665 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1 className="text-center text-[16px] leading-[1.5] font-medium text-b-200">마이페이지</h1>

        {/* 전역 button { font: inherit } 이 글자 클래스를 덮어써서 span에 지정 */}
        <button type="button" onClick={handleSave} className="cursor-pointer">
          <span className="text-right text-[14px] leading-[1.5] font-semibold text-p-300">
            저장
          </span>
        </button>
      </header>

      {/* 닉네임 입력 (TODO: 헤더 아래 간격 · 안내 문구 간격은 캡처 기준 추정값) */}
      <section className="flex flex-col px-5 pt-11">
        <label htmlFor="nickname" className="text-[18px] leading-[1.4] font-semibold text-b-200">
          닉네임
        </label>

        {/* 전역 input { font: inherit } 이 글자 클래스를 덮어써서 ! 로 우선순위 지정 */}
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setIsSubmitError(false);
          }}
          className="mt-3 w-full rounded-[8px] bg-n-900 px-5 py-3 text-[14px]! leading-[1.5]! font-medium! text-b-200 outline-none"
        />

        {helper && (
          <p
            role={helper.isError ? 'alert' : undefined}
            className={`mt-2 text-[12px] leading-[1.5] font-normal ${helper.isError ? 'text-[#FF6F6F]' : 'text-b-400'}`}
          >
            {helper.text}
          </p>
        )}
      </section>
    </div>
  );
}

export default NicknameEditPage;
