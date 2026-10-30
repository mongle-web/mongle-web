// AI가 다듬은 꿈 이야기의 한 조각
// isAi가 true면 AI가 새로 쓴 부분 → "AI 작성 부분 표시"를 켰을 때 강조
export interface DreamStorySegment {
  text: string;
  isAi: boolean;
}

// 꿈 상세 정보
export interface DreamDetail {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  content: string; // 사용자가 직접 쓴 원래 꿈 내용
  aiStory?: DreamStorySegment[]; // AI가 다듬은 이야기 (없으면 토글 없이 원문만 표시)
  imageUrl?: string; // 생성한 꿈 이미지 (없으면 "이미지 생성하기" 표시)
  emotions: string[]; // 사용자가 고른 감정 (1~3개)
  keywords: string[]; // AI가 뽑은 키워드 (1~5개)
  revision: number; // 수정할 때 백엔드에 넘기는 최신 버전
}

// 꿈 수정 요청 (제목 · 내용만 수정 가능, 감정 · 키워드는 수정 불가)
export interface DreamDetailUpdate {
  title: string;
  content: string;
}

// 제목이 아직 없는 꿈(AI 분석 전 등)에 대신 보여줄 문구 (화면 표시용, 저장하지 않음)
export const UNTITLED_DREAM_TITLE = '제목 없는 꿈';

// 수정 화면 글자 수 제한
export const DREAM_TITLE_MAX_LENGTH = 20;
export const DREAM_CONTENT_MAX_LENGTH = 500;
