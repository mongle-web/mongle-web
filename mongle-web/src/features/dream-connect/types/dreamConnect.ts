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
  failureCode?: string;
}

// 연결하려면 꿈을 최소 2개 골라야 함 (스웨거: "선택한 꿈이 2개 이상")
export const MIN_CONNECT_DREAMS = 2;

// 연결 결과 화면에 필요한 정보 (여러 API 응답을 합친 값)
export interface WorldResult {
  worldId: number;
  name: string; // 세계관 이름 → 화면 맨 위 제목
  story: string[]; // 몽글의 꿈 연결 스토리 (문단 단위)
  commonKeywords: string[]; // TODO: 백엔드 API 추가 예정 (없으면 빈 배열)
  repeatedEmotions: string[]; // TODO: 백엔드 API 추가 예정 (없으면 빈 배열)
  dreams: ConnectableDream[]; // 연결된 꿈 (날짜순)
}

// 결과 화면 "+" → 선택 화면으로 넘길 값 (이미 연결된 꿈은 체크된 채로 시작)
export interface ConnectAddState {
  worldId: number;
  connectedDreamIds: number[];
}
