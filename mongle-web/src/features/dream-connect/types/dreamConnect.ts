// 꿈 선택 목록 정렬 (스웨거 GET /api/v1/archives 의 sort)
export type ConnectSort = 'LATEST' | 'OLDEST';

// 꿈 선택 목록의 꿈 한 개 (스웨거 ArchiveItem 중 화면에 필요한 값)
export interface ConnectableDream {
  dreamId: number;
  dreamedAt: string; // 'YYYY-MM-DD'
  title: string;
}

// 세계관(= 꿈 연결) 폴더 (스웨거 WorldFolderResponse 중 필요한 값)
export interface WorldFolder {
  worldId: number;
  name: string;
  selectedDreamCount: number;
  revision: number; // 이름 · 선택 목록이 바뀔 때마다 증가, 다음 요청에 그대로 전달
}

// 연결(세계관 완성본) 생성 상태 (스웨거 WorldCompositionResponse 중 필요한 값)
export type WorldCompositionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface WorldComposition {
  worldId: number;
  status: WorldCompositionStatus;
  compositionRevision: number; // 완성본 버전, 다시 연결할 때 그대로 전달 (최초 0)
  attemptId: string | null; // 생성 요청 기록 (null = 아직 생성 요청이 접수되지 않음)
  jobVersion: number; // 생성 작업 버전 (새 작업인지 비교할 때 사용)
  failureCode?: string;
}

// 연결하려면 꿈을 최소 2개 골라야 함 (스웨거: "선택한 꿈이 2개 이상")
export const MIN_CONNECT_DREAMS = 2;

// 연결 결과 화면에 필요한 정보 (여러 API 응답을 합친 값)
// 제목(AI) · 공통 키워드 · 반복되는 감정은 세계관 요약(WorldSummary)에서 따로 받음
export interface WorldResult {
  worldId: number;
  name: string; // 세계관 폴더 이름 (AI 제목이 아직 없을 때 제목으로 사용)
  story: string[]; // 몽글의 꿈 연결 스토리 (문단 단위)
  dreams: ConnectableDream[]; // 연결된 꿈 (날짜순)
  // 지금 완성본(이야기)에 실제로 남아 있는 꿈 수 (원본 꿈을 지우면 줄어듦)
  // 이미지 생성 가능 여부는 선택한 꿈 수가 아니라 이 값으로 판단 (2개 이상, 백엔드 정책)
  composedDreamCount: number;
}

// 세계관 요약 생성 상태 (스웨거 WorldSummaryResponse.status)
// EMPTY: 출처 없음 · NOT_GENERATED: 미요청 · PENDING: 대기 · PROCESSING: 생성 중 · COMPLETED: 완료 · FAILED: 실패
export type WorldSummaryStatus =
  'EMPTY' | 'NOT_GENERATED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// 세계관 요약 (AI 제목 · 공통 키워드 · 반복되는 감정, 스웨거 WorldSummaryResponse 중 화면에 필요한 값)
// 연결이 완성되면 서버가 자동으로 만들기 시작해서 결과 화면보다 늦게 완성될 수 있음
export interface WorldSummary {
  status: WorldSummaryStatus;
  generatedTitle: string | null;
  commonKeywords: string[]; // commonKeywords[].keyword
  recurringEmotions: string[]; // recurringEmotions[].label
  hasPreviousResult: boolean; // 생성 중 · 실패여도 이전에 완성된 결과가 있으면 true (그 값을 보여줄 수 있음)
}

// 결과 화면 "+" → 선택 화면으로 넘길 값 (이미 연결된 꿈은 체크된 채로 시작)
export interface ConnectAddState {
  worldId: number;
  connectedDreamIds: number[];
}

// 세계관 이미지 생성 상태 (스웨거 WorldImageResponse 중 필요한 값)
export interface WorldImage {
  worldId: number;
  status: WorldCompositionStatus; // PENDING · PROCESSING · COMPLETED · FAILED
  imageVersion: number;
  failureCode?: string;
}

// 세계관 이미지 최초 생성에 필요한 토큰(크레딧) 수 (백엔드 정책: 최초 생성 3, 첫 재생성 무료, 이후 재생성 1)
// 생성에 실패하면 토큰을 쓰지 않으므로 "다시 생성하기"도 같은 값
export const IMAGE_TOKEN_COST = 3;
