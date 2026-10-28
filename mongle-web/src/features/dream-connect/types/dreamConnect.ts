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
  failureCode?: string;
}

// 연결하려면 꿈을 최소 2개 골라야 함 (스웨거: "선택한 꿈이 2개 이상")
export const MIN_CONNECT_DREAMS = 2;
